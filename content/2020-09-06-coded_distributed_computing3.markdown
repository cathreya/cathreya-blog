---
layout: post
title:  "Coded Distributed Computing Part 3: A General Scheme"
date:   2020-08-29 00:18:23 +0700
categories: [coding_theory, tcs]
---

I have been reading this <a target="_blank" href="https://arxiv.org/abs/1604.07086" >paper </a> and want to share some interesting ideas that are presented. If you haven't already, take a look at [part 1]({% post_url 2020-08-26-coded_distributed_computing %}) and [part 2]({% post_url 2020-08-27-coded_distributed_computing2 %}).

**Note:** This is **not** my work, I just use the word "our" to make it easier for me to communicate some ideas. 


In the last post I described a scheme for the simple example. In this one, I'll try describing the general scheme. This gets fairly involved, so I will try to provide some commentary wherever I can.


## Function redundancy
Earlier we considered increasing the computational load by having multiple nodes compute functions over the same file. However, at the end, for a single function, only one node computed its output by carrying out the reduce. In order to truly generalize our scheme, we must account for cases where multiple nodes carry out reduces for a single function. Thus we introduce another parameter to characterize this.

Let $$ s $$ be a parameter representing the number of nodes that computes a function. This scheme only considers a symmetric assignment: every function is computed by exactly $$ s $$ nodes.

This generalization also has real world significance. In most Map-Reduce applications, there are multiple rounds of computation. The output of each round serves as input to subsequent rounds. Thus having the output in multiple nodes serves as data redundancy for the round that follows.

## The Coded Distributed Computing Scheme

### Preliminaries

#### Distributing the Files
Lets generalize what we did for the example. We have $$ N $$ files and have to distribute these among $$ K $$ nodes. The distribution we did in the example seemed to work well, so lets try the same thing. Lets assign each file to an $$ r $$ sized subset of nodes. There are $$ {K \choose r} $$ such subsets. Hence each subset stores a partition of $$ \eta_1 = \frac{N}{K \choose r} $$ files. If the number of files aren't divisible, we can always add empty files without asymptotically affecting the load.

Let $$ M_i $$ be the set of files stored at node $$i$$. Every subset of size $$r$$ containing node $$i$$ is assigned $$\eta_1$$ files. Thus $$ \text{\textbar}M_i\text{\textbar} = {K-1 \choose {r-1}} \eta_1$$. Now $$ \frac{\sum_i M_i}{N} = \frac{K {K-1 \choose {r-1}} \eta_1}{N} $$. Substituting $$ \eta_1 = \frac{N}{K \choose r} $$ and simplifying, we get, $$ \frac{KrN}{KN} = r $$ which matches our original definition of $$ r $$.

#### Distributing the Functions
Lets do the same thing for functions as well. Since each function is reduced by exactly $$ s $$ nodes, lets distribute each function to a subset of size $$ s $$. Thus each subset reduces a partition of $$ \eta_2 = \frac{Q}{{K \choose s}} $$ functions. Let $$ W_i $$ be the set of functions reduced by node $$ i $$. Using similar calculations, we can see that $$ \text{\textbar}W_i\text{\textbar} = \frac{sQ}{K} $$.

### The Key Construction
For the example, we used the redundancy in intermediate values (I will often refer to them as simply values) in order to send encoded messages. A more general idea is to choose a subset of the nodes and exchange intermediate values among them by harnessing the redundancy in that subset. If we choose these subsets intelligently, we can hope to minimize the overall communication. This key construction will decide these subsets and what values will be exchanged within them.

For a set $$ S $$ of nodes, consider an $$ r $$ sized subset and call it $$ S_1 $$. Let us look at some desirable properties of the intermediate values that should be exchanged.

1. These values are known exclusively to the nodes in $$ S_1 $$. Recall that since $$ S_1 $$ is an $$ r $$ sized subset, it contains a partition of $$ \eta_1 $$ files that are available only to nodes in it. Thus any intermediate values due to an input file in this partition is available exclusively to the nodes in $$ S_1 $$. We can think of these nodes as the "providers" of the values.

2. These values are required by **all** nodes in $$ S \text{\textbackslash} S_1 $$. Recall that a value $$ v_{q,w} $$ is required by a node, if the node reduces function $$ q $$ but does not have file $$ w $$. If we're exchanging values between the files in $$ S $$, it seems wasteful communicating values that are not required by some node in $$ S \text{\textbackslash} S_1 $$. We thus restrict ourselves and hope that if a node requires something that is not required by all elements in $$ S \text{\textbackslash} S_1 $$, that node will receive it while exchanging values among some other subset. 

3. These values are required **only** by the nodes in $$ S $$. This means that no nodes outside of $$ S $$ require these values. The intuition for this is along the lines of: if we're delivering values supplied by the "providers", we may as well deliver them all in one swoop.

Lets take all values that satify all three of these conditions and concatenate their binary representation. Let us call the resultant bit vector $$ U_{S,S_1} $$. 

### Encoding
Now that we've pinpointed what values we're interested in, let us define a coding scheme to actually exchange those values among the elements in $$ S $$. Let $$ \text{\textbar}S\text{\textbar} = m $$ for notational conveninece. For a particular node $$ k $$, let $$ n_1 = {m-1 \choose r-1} $$ be the number of subsets of $$ S $$ of size $$ r $$ that contains $$ k $$. Lets index these subsets as $$ S_i $$. In all of these $$ n_1 $$ subsets $$ k $$ is a "provider" and already has all the values of $$ U_{S,S_i}. 

When acting as a "receiver", for some "provider" $$ k'$$, let $$ n_2 = {m-2 \choose r-1} $$ be the number of subsets of size $$ r $$ that does not contain $$ k $$ but contains $$ k' $$. 

The bit vector $$ U_{S,S_i} $$ is actually known by all nodes in the set $$ S_i $$, including node $$ k $$. Lets  split this evenly into $$ r $$ parts where the jth part is represented by the bit vector $$ U_{S,S_i}[j] $$. Intuitively, each of these parts correspond to a node in $$ S_i $$. 



### To be finished


