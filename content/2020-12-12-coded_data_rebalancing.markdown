---
layout: post
title:  "Coded Data Rebalancing"
date:   2020-12-12 00:18:23 +0700
categories: [coding_theory, tcs]
---

I was reading this [paper](https://arxiv.org/abs/2001.04939) by Prasad et. al. Here I'll try to motivate the problem and talk about the cool scheme proposed in the paper. **Note:** This is **not** my work, I just use the word "our" to make it easier for me to communicate some ideas. 

## Motivation
In distributed systems nodes tend to enter and exit the system due to several reasons, most notably failure. In such cases it is wise to store files in a way that data isn't lost due to such an occurence. Several distributed file systems acheive this by breaking the data into chunks and storing each of them in multiple nodes. If each chunk is stored in $$r$$ nodes, the system is said to have a **replication factor** of $$r$$. Now, for $$r>1$$, in the case of a node failure, we don't have to worry about losing the data stored at the node because one of its replicas are still available. 

However, leaving the system like this would be unwise. The replication factor of all chunks that were present in the failed node is now reduced by one. Suppose $$r=2$$ or some other small number, it is possible that subsequent failures may result in permanent loss of data! However just replicating those chunks and randomly storing them won't be sufficient: distribution of chunks across the nodes would no longer be even and hence the load will no longer be balanced uniformly. This may cause some nodes to receive more traffic and hence end up being a bottleneck for the overall task.

Fine, just replicate them and carefully distribute them so that they're even! Unfortunately, it isn't that easy: even carefully distributing them requires transfers of huge amounts of data. Fortunately, we can abuse the redundancy of chunks in the system to introduce some coded multicasts to minimize the communication during this rebalancing process.

## Formalizing the problem
Consider a file $$W$$ to be a binary string of length $$N$$. Let $$K$$ be the number of nodes in the system. Let us define the notion of the system being **"r-balanced"**. For a subset $$B \subset [K]$$, let $$r_n(B)$$ be the no. of copies of the $$n$$th bit among the nodes in $$B$$. The system is said to be r-balanced if $$r_n([K]) = r$$ for all $$n$$, and the amount of data $$|C_i|$$ stored in each node $$i$$ is equal, i.e. $$|C_i| = \frac{rN}{k} = \lambda N$$, where $$\lambda$$ denotes the storage fraction at any node. Now when a node $$k$$ is removed, the set of nodes becomes $$[K]\\k$$. In order to maintain the r-balance property, $$\lambda_{rem} = \frac{r}{K-1} = \frac{K \lambda}{K-1}$$. So a **rebalancing scheme** can be informally thought of as a way to go from an r-balanced system of $$K$$ nodes to an r-balanced system of $$K-1$$ nodes. The **communication load** incurred during this process is the total number of bits transmitted normalized by the total number of bits stored. Our aim is to minimize this communication load incurred. It turns out that there is a scheme that can acheive a communication load of $$\frac{1}{r-1}$$ given that the file size $$N$$ is a multiple of $$(r-1)P(K+1,K+1-r)$$, where $$P(K+1,K+1-r)$$ is the usual number of ordered subsets of $$[K+1]$$ of size $$K+1-r$$. This strange requirement will be apparent when we actually look at the scheme. It also turns out that this load is optimal for a given replication factor! (This is proved in the paper but I won't prove it here).

## The Scheme: An example
Its a good idea to illustrate the scheme using an example. In fact the scheme is so elegant, you should be able to extend this specific case automatically to the general case.
### Assigning the chunks
Consider $$K=5$$ nodes with replication factor $$r=3$$. The scheme works as follows - 
- Partition the file into $$P(K,K-r) = P(5,2) = 20$$ chunks. 
- Index each chunk by an ordered subset of $$[5]$$ of length $$K-r = 2$$.
- In each node, store the chunks whose index doesn't countain the node number. For example node $$1$$ will store $$W_{[2,3]}$$, $$W_{[2,4]}$$, $$W_{[2,5]}$$, $$W_{[3,2]}$$, $$W_{[3,4]}$$, $$W_{[3,5]}$$, $$W_{[4,2]}$$, $$W_{[4,3]}$$, $$W_{[4,5]}$$, $$W_{[5,2]}$$, $$W_{[5,3]}$$, $$W_{[5,4]}$$.

Notice that this way each node stores $$P(K-1, K-r) = P(4,2) = 12$$ chunks. Thus $$\lambda = \frac{12}{20} = \frac{3}{5}$$. 

### Rebalancing
Consider the case when node 5 is removed. The chunks stored in node 5, i.e. the chunks whose indices don't contain 5 are no longer replicated by a factor of $$r=3$$. These must now somehow be transmitted. A good idea is to have it so that the resulting distribution of chunks is now indexed by an ordered subset of $$[4]$$ of length $$K-1-r = 1$$ so that the propery described above still holds. Thus we need a way to not only transfer chunks efficiently, but also relabel them.

Lets see how we can acheive the first part. Lets first divide the chunks that were in node 5 into 4 disjoint groups: $$G_4 = \{W_{[1,4]},W_{[2,4]},W_{[3,4]}\}$$, $$G_3 = \{W_{[1,3]},W_{[2,3]},W_{[4,3]}\}$$, $$G_2 = \{W_{[1,2]},W_{[3,2]},W_{[4,2]}\}$$, $$G_1 = \{W_{[2,1]},W_{[3,1]},W_{[4,1]}\}$$. Why these groups? Let us look at $$G_4$$. If we consider the first coordinate of the indices in the group, we get $$\{1,2,3\}$$. Notice now that each chunk in the group is available to exactly two nodes in $$\{1,2,3\}$$. For instance, $$W_{[1,4]}$$ is available to the nodes 2 and 3 but not to 1. Notice this property holds for all each chunk in each group.

How do we make use of this property? Suppose we can deliver each chunk to the node it is not available in we can relenish the replication factor back to 3 while maintaining the r-balance property! If this is not immediately clear to you, just notice that each node receives 3 chunks and each chunk goes to a distinct node. If we're convinced, do we just send these chunks straight away? It turns out we can do better! Lets split each of these chunks in two parts. Consider $$W_{[1,4]}$$, we can split this into $$W_{[1,4],2}$$ and $$W_{[1,4],3}$$. This sub-index represents which node that node 1 will receive this sub-chunk from. Similarly, $$W_{[2,4]}$$ is split into $$W_{[2,4],1}$$ and $$W_{[2,4],3}$$ and $$W_{[3,4]}$$ to $$W_{[3,4],1}$$ and $$W_{[3,4],2}$$. Enter XOR magic: Node 1 multicasts $$ W_{[2,4],1} \oplus W_{[3,4],1} $$. The intended recipients are nodes 2 and 3 respectively. Now that node 2 already has $$W_{[3,4],1}$$ and so it can recover $$W_{[2,4],1}$$. Similarly node 3 already has $$W_{[2,4],1}$$ and so can recover $$W_{[3,4],1}$$. This way, for each group we only need to do 3 multicasts. Thus for the 4 groups we only need to do 12 transmissions each of size half of a chunk. Thus we are transfering 6 chunks worth of data. Thus we acheive a communication load of $$\frac{6}{12} = \frac{1}{2}$$. If we hadn't introduced this XOR multicast, we would have had to send 12 chunks worth of data, hence the improvement is immediately apparent.

### Re-indexing
Now each node has the extra chunks. However, now each chunk should be indexed by an ordered permutation of size $$ K-1-r = 1 $$ in order to maintain the structure. Consider node 1. After rebalancing it now posseses $$W_{[2,3]}$$, $$W_{[2,4]}$$, $$W_{[2,5]}$$, $$W_{[3,2]}$$, $$W_{[3,4]}$$, $$W_{[3,5]}$$, $$W_{[4,2]}$$, $$W_{[4,3]}$$, $$W_{[4,5]}$$, $$W_{[5,2]}$$, $$W_{[5,3]}$$, $$W_{[5,4]}$$, $$W_{[1,4]}$$, $$W_{[1,2]}$$, $$W_{[1,3]}$$. Now consider all the files whose index has suffix 2,  these are $$W_{[1,2]}$$, $$W_{[3,2]}$$, $$W_{[4,2]}$$, $$W_{[4,2]}$$. To this add $$W_{[2,5]}$$ and relabel it $$W_{[2]}$$. Repeating similarly for suffix 3 and 4 we get - 

$$W_{[2]} = \{$$, $$W_{[1,2]}$$,$$W_{[3,2]}$$,$$W_{[4,2]}$$,$$W_{[5,2]}$$,$$W_{[2,5]}\}$$ 
$$W_{[3]} = \{$$, $$W_{[1,3]}$$,$$W_{[2,3]}$$,$$W_{[4,3]}$$,$$W_{[5,3]}$$,$$W_{[3,5]}\}$$ 
$$W_{[4]} = \{$$, $$W_{[1,4]}$$,$$W_{[2,4]}$$,$$W_{[3,4]}$$,$$W_{[5,4]}$$,$$W_{[4,5]}\}$$ 

After this re-indexing step, 

Node 1 stores: $$W_{[2]},W_{[3]},W_{[4]}$$
Node 2 stores: $$W_{[1]},W_{[3]},W_{[4]}$$
Node 3 stores: $$W_{[1]},W_{[2]},W_{[4]}$$
Node 4 stores: $$W_{[1]},W_{[2]},W_{[3]}$$

This has the same structure as earlier!

## The Scheme: General Case
Given the above example, I'd recommend you try extrapolating the general scheme yourself. 
### Assigning the chunks
For $$K$$ nodes with replication factor $$r$$. The scheme works as follows - 
- Partition the file into $$P(K,K-r)$$ chunks. 
- Index each chunk by an ordered subset of $$[K]$$ of length $$K-r$$.
- In each node, store the chunks whose index doesn't countain the node number. 

Now for each index, there are exactly $$r$$ elements in $$[K]$$ that are not present in the index. Thus each chunk goes to exactly $$r$$ nodes. Now $$\lambda = \frac{P(K-1, K-r)}{P(K,K-r) = \frac{r}{K}}. Thus this indeed maintains the r-balance property even for the general case.


### Rebalancing
Suppose node $$k$$ is removed. Let $$A_k$$ be the set of indices that was present in node $$k$$, i.e. the ordered subsets of $$[K]$$ of size $$K-r$$ that do not contain $$k$$. Now we partition the chunks into groups. These groups (as you might have guessed from the example) are identified by their suffix. More formally, $$G_{i'} = \{i \in A_k \vert [i_2, i_3, \cdots, i_{K-r}] = i'\}$$. Each element of the group thus differs only in $$i_1$$. There are exactly $$r$$ possibilities for $$i_1$$. Hence each group contains $$r$$ indices. The number of groups is thus the total number of chunks divided by the size of each group, i.e. $$\frac{P(K-1,K-r)}{r}$$.

Now again consider the nodes corresponding to the first coordinate of the indices in a group. Any chunk within this group is available to exactly $$r-1$$ of these nodes. Again you can guess the next step: each chunk is split into $$r-1$$ parts with the sub-index representing which node the sub-chunk will be received from. Each node then multicasts the XOR of all the sub-chunks it is responsible for sending. Thus each node ends up multicasting $$\frac{1}{r-1}$$th of a chunk. Thus a total of $$\frac{r}{r-1}$$ chunks equivalent of data is transferred. We know that the size of a chunk is $$\frac{N}{P(K,K-r)}$$. Hence the communication cost is $$\frac{Nr}{(r-1)P(K,K-r)}$$ for that particular group. Now the overall communication cost is simply $$\frac{P(K-1,K-r)}{r} \cdot \frac{Nr}{(r-1)P(K,K-r)} = \frac{Nr}{(r-1)K} = \frac{N\lambda}{(r-1)}$$. Thus the communication load (recall this is simply normalizing by the total data stored) is $$\frac{1}{(r-1)}$$!

Each node corresponding to the first coordinate of the indices in a group, receive exactly 1 chunk from that group. Thus the total number of chunks received by a node is equal to the number of groups in which the node appears as the first coordinate. Verify that this is given by $$P(K-2, K-1-r)$$. Also, the group originally possesed $$P(K-1,K-r)$$ chunks. Thus now it posseses a total of $$P(K-2, K-1-r)+P(K-1,K-r) = KP(K-2,K-1-r)$$. Thus the amount of data stored is simply $$ K P(K-2,K-1-r) \times \frac{N}{P(K,K-r) = \frac{Nr}{K-1}}$$. Hence the new storage fraction $$\lambda_{rem} = \frac{r}{(K-1)} = \lambda\frac{K}{(K-1)}$$ which is exactly what we wanted to acheive.

### Re-indexing
This part is a bit more cryptic to extrapolate from the example. Consider the set $$S$$ of ordered subsets of $$[K]\\k$$ length $$K-1-r$$. We want the new files to be re-indexed using the elements of $$S$$. Now, as in the case of groups, for some $$i' \in S$$ there are exactly $$j_1, j_2, \cdots, j_r$$ elements in $$[K]\\k$$ such that $$j_i \notin i'$$. Then the file indexed by $$i'$$, is given by- 

$$W_{i'} = W_{[j_1,i']} $$, $$W_{[j_2,i']}$$, $$\cdots$$, $$W_{[j_r,i']}$$, $$W_{[k,i_1',\cdots,i_{K-1-r}']}$$,$$W_{[i_1',k,i_2',\cdots,i_{K-1-r}']}$$, $$\cdots$$, $$W_{[i_1',i_2', \cdots,i_{K-1-r}', k]} $$.

It is important to note that any file that contains any chunk with $$i'$$ as the suffix will definitely contain all of the other chunks being concatenated to form $$W_{i'}$$. The only chunk node $$i$$ could have missed would be $$W[i,i']$$ but it is ensured to get this from group $$G_{i'}$$. The rest it would have possessed from the beginning. 

Thus on re-indexing we maintain the structure.

## Conclusion
Overall we saw a scheme to rebalance data on node failure with a communication load of $$\frac{1}{(r-1)}$$ such that it maintains not only the r-balanced property but also remains structurally invariant due to re-indexing. The paper goes on to prove that the communication load for this is actually a lower bounded by $$\frac{1}{(r-1)}$$! But I will leave the proof of that for you to read yourself.