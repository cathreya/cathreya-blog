---
title: How I Automated My Accounting with RAG and Local LLMs
date: 2025-09-07
tags:
  - LLM
  - ML
  - AI
  - Beancount
---

I regularly engage in this extremely mundane activity every two months where I comb through all my bank and card statements for this period and capture this in a plaintext double-entry accounting format called [Beancount](https://github.com/beancount/beancount). Put simply, Beancount represents every transaction as a movement of money between accounts such that the sum of debits and credits are zero. Its a neat way of categorizing expenses. This example transaction:
```
2025-05-10 * "TARGET SAN JOSE CA"
    Assets:XYZBank                                                  -10.66 USD
    Expenses:Grocery
```
captures a 10 dollar spend towards groceries.

For the most part this is a way to stay on top of my expenses, understand whether I need to make adjustments to my lifestyle and gives me data about my finances that I can query or analyze programmatically. I chose Beancount mainly because its plaintext: I don't have to rely on some proprietary format or some company choosing to maintain their accounting software. But the massive added benefit is that since it is plaintext I can do a lot of things since I know how to write code. For instance, the ledger can be completely version controlled. I can write all manner of analyzers on top of this (or use the multiple ones that have been open sourced). 

Beancount is just fantastic apart from the painstaking task of labelling each transaction on your statement. Some people enjoy sifting through their history and recounting where they spent their time and money, but it gets very boring very fast to label the fifty transactions with Uber with the "taxi" category. I wanted to just throw the entire statement to an LLM and ask it do this for me. But like most of you, I didn't want to send my entire transaction history over the internet. So I decided to use local LLMs. Since this is a relatively simple multi-class classification task, good old fashioned ML should do a solid job. However, these models don't have world knowledge. An LLM can infer that a transaction at a restaurant made in Hawaii is probably a travel expense rather than a food expense (ignoring all you wonderfully lucky people who live there). This should in theory make it much easier for an LLM to classify "new" transactions. Plus, it was a great opportunity for me to actually learn to use local LLMs. So a challenge I set myself was to write all the code myself: I can use Claude to give me direction or pointers, but the actual code will be handwritten. I think this is a good balance for maximizing learning.

## Approach 1: Zero Shot
Setting up the skeleton was fairly simple. Tools like LMStudio lets you host a model locally and expose OpenAI-like API endpoints. I could fit an instance of `gemma-3-12b` on my RTX 3090. Building the model call scaffolding was then just like making a POST request to the API endpoint. Once that was done I tried getting it to classify some of my transactions. In the prompt, I explained what Beancount was, what the expected categories are and what the expected output should be.

It does miserably.

The problem is the model doesn't have any understanding of my previous transactions or categories. While it gets generic things like cab fare expenses correct, it has no way knowing that, for instance, the GoogleOne category is for my recurring GoogleOne subscription. The natural extension therefore is to provide it examples of previous transactions in context.

## Aside: Performance
If you've ever worked with an LLM before, you'll know that the performance bottleneck is definitely the actual inference call. I wanted my classifier to minimize the number of calls, so I batched multiple transactions together. In practice this was doing a bunch of prompting tricks to ensure that the model outputs the same number of categories in the same order as the input. Playing around with this, I found that batching more than 10 transactions in a single call starts resulting in off-by-one errors.
## Approach 2: In-context Learning
The key challenge here is to understand which examples are actually useful to provide in context. Even if I could fit all the transactions into the 120K token context window, [papers](https://arxiv.org/abs/2307.03172) suggest that models do poorly when relevant examples are in the middle of the context window. Since my transactions wouldn't be ordered by relevance, the most useful examples for each classification may end up in these "dead zones". Another attempt I made was to select a "representative set" of transactions. For each category I tried to fetch at least one transaction of that category to place in context. This already performs much better than the zero-shot approach. However this runs into a few problems.
1. Some categories need more examples than others. While it is sufficient to provide a single example for a transaction involving Uber, a restaurant category will need multiple examples. I really didn't want to go through my whole list of transactions and manually create this representative set.
2. Large contexts seem to confuse the model. Having multiple diverse transactions seem to give the model too many options. This manifests in obvious errors: giving two transactions at Target two different categories (Groceries and Shopping), or misclassifying a recurring transaction like my utility bill into a generic "Bills" instead of the more specific "Electricity".
3. Batching does poorly. Other transactions in the batch seem to confuse the model. e.g. a grocery store transaction when surrounded by restaurant transactions get incorrectly classified as a restaurant.
I wanted a way to programmatically custom-create a representative set of transactions based on the transactions to be classified. Enter RAG.
## Approach 3: Retrieval-Augmented-Generation (RAG)
The idea behind RAG is simple but powerful. For most ML to work, messy real world input has to be represented as concise vectors called embeddings in a vector space called the embedding space. Turns out some of these embedding spaces preserve the semantics of the input being encoded. This means semantically similar inputs are encoded into vectors that are nearby each other in the embedding space. This unlocks a new way of performing search:
1. encode all inputs into a vector in the embedding space.
2. encode a query using the same encoding. 
3. fetch the k nearest neighbors to the encoded query vector.

The fetched neighbors are the ones in the dataset that are semantically most similar to the query. This is the R in RAG. Using this Retrieval algorithm, you can Augment the context of your LLM with the most relevant examples in your data before Generating the response. This is the secret sauce behind most of the recent hot AI startups (no shade to them, getting this right is a massive challenge). 

This formulation lends itself extremely well to our classification problem. For each input transaction, I can fetch semantically similar transactions and store them in context. But there are a few details I had to iron out.

### What to encode?
A typical Beancount transaction has a bunch of extra information. e.g.
```
2025-05-10 * "TARGET SAN JOSE CA"
    Assets:Card                                                      -10.66 USD
    Expenses:Grocery
```
Here, the date is irrelevant to the classification. Also the final class itself shouldn't be encoded since this will be missing from the query (remember the query is encoded in the *exact* same way). In my case, how the expense was paid for doesn't affect the class. Finally the pretty formatting adds no value. Thus a concise representation to encode is simply:
`TARGET SAN JOSE CA|-10.66|USD`
So when later we get a query to classify:
```
2025-06-03 * "TARGET SUNNYVALE CA"
    Assets:AnotherCard                                                -13.25 USD
```
This will also be simplified to `TARGET SUNNYVALE CA|-13.25|USD` before encoding.
### How do I encode?
The neat part about RAG is that it separates the Retrieval and the Generation. This means I can make independent decisions on how to encode inputs. I decided to use a smaller model for embedding: `all-MiniLM-L6-v2`. This is a sentence transformer that outputs a 384 dimensional vector. Note this is independent of the size of the embedding space of the `gemma-3-12b` LLM since the encoding and decoding both take place at the Retrieval stage before the LLM is even involved. This is particularly advantageous since I can use an embedding model optimized for similarity tasks rather than use the embedding space of the text generation model. Since my database is relatively small, I opted to re-encode everything before each run and keep the vectors in memory. A more complete solution would store these vectors in a vector database like Pinecone. This is something I may do in the future.
### How do I find nearest neighbors?
I used cosine similarity: i.e. a measure of the angle between the two vectors. A smaller angle means the vectors are pointing in the same direction implying a high similarity. 

Like most things in ML there's no solid mathematical reason apart from empirical evidence that it works really well. Why use it instead of something like a Euclidean distance? The most plausible explanation I've read seems to be that distance metrics seem to weight magnitude heavily and in the embedding space magnitude is influenced a lot by input length. The angle between embeddings however is scale-invariant.

So we simply compute the cosine similarity of the query vector with all the vectors in the database and return the top k. I chose k as 3 arbitrarily since it performed decently well. A higher number provides more examples but uses up more of the context.
### How does this interact with batching?
I decided to do the simplest possible thing. I would fetch the k nearest neighbors for each transaction in the batch. I would then de-duplicate them and use those in context. This means in the worst case we can have `k * #batch_size` transactions in context. 

### Performance
This does really well. RAG solves problem 1 and 2 from in-context learning. The results were good enough that I was happy to re-classify the few mistakes it made by hand and call it a day. However, when I was reclassifying things, I noticed that problem 3 still showed up. Especially, if a batch contained diverse input transactions, it would contain diverse examples in context confusing the model. If only there was a way to make sure batches contained similar inputs.
## Approach 4: Smart Batching
Since we already have a similarity measure, we can use that similarity measure to batch transactions together. Since the embeddings of similar transactions are close to each other in the embeddings space, we can cluster these together into a single batch. To do this I used the simplest clustering algorithm: k-Means Clustering. I knew I wanted a fixed batch size, so I set `k = len(input)/batch_size`. If a cluster is of a size larger than the batch size I would iterate `batch_size` transactions at a time. I repeat the RAG approach on each batch. k-Means does very well, since similar transactions , e.g. multiple Uber transactions, cluster together in the embedding space.

This performs fabulously. Out of the 580 transactions in my test set I had to manually reclassify only 19. This is a test set accuracy of 97%! A wonderful side-effect of the smart batching was that since similar transactions were together, I could easily glance check blocks of transactions with minimal effort making manual verification a lot easier.

What surprised me the most was it managed to classify brand new transactions correctly by inferring off previous examples. For instance, for travel expenses I would have the name of the place followed by a category e.g. `Expense:Travel:Rome24:Food`. For a brand new location, the LLM managed to generate a new category e.g. `Expense:Travel:Boulder25:Transport`, one of the reasons I wanted to use an LLM in the first place.

## What next?
For my personal use this is more than enough. However a part of me really wants to implement a database just for my own understanding. I also want to try and make this more efficient: I see some low hanging fruit replacing some loops with matrix multiplications. I am also interested in understanding how these things are packaged into a product, especially considering the local LLM calls.

A few related Beancount + AI ideas I want to play with:
1. Writing a generic parser that can convert any bank/card statement into Beancount format. I was thinking of using an LLM to understand the structure of the document to then generate the extraction code.
2. Talk to my ledger. I want to create an MCP server to query my ledger. I can then use an LLM to act as a budgeting coach.
3. Receipt auto-classifier. Instead of batch processing transactions from a statement, maybe every time I get a receipt, I can take a photo and a model can automatically convert this to Beancount and classify it.