---
layout: post
title:  "Repairable Product Matrix Codes"
date:   2021-01-27 00:18:23 +0700
categories: [coding_theory, tcs]
---

In the [last post on Repairable Codes]({% post_url 2020-12-09-repairable-codes %}), I described some bounds on the fraction of data that is to be strored in order to minimize the communication load during the repair. Here I'll describe an actual code that acheives these bounds and also describe how the repair and recovery processes work. This construction is from ["Optimal Exact-Regenerating Codes for Distributed Storage at the MSR and MBR Points via a Product-Matrix Construction"](https://www.cs.cmu.edu/~rvinayak/papers/product_matrix_codes.pdf).

**Note:** This is **not** my work, I just use the word "our" to make it easier for me to communicate some ideas. 

## The Setup
Lets recall the parameters we introduced. Suppose our "file" is a represented as $$B$$ symbols in the field $$F_q$$ of size $$q$$. The data is stored across $$n$$ nodes such that it can be recovered by connecting to $$k$$ of them. Additionally, we want that when a node fails, we should be able to repair the code (maintain the property that connecting to any $$k$$ nodes can recover the file) by  making the new node communicate with some arbitrary $$d$$ nodes and receive $$\beta$$ symbols from each of them. We are interested in minimizing the communication load, $$d\beta$$ incurred during this repair process. But we know that there is a fundamental tradeoff between this load and how much data must be stored. We'll denote the number of symbols stored in each node by $$\alpha$$. A trivial repair would be to connect to $$k$$ nodes and recover the entire file before reconstructing the fraction. However, in such a case, $$B$$ bits are transferred. Our goal here is to see how we can do better.

## Tradeoff and Optimality

### Cutset Bound and Optimality
The tradeoff between the storage and the communication was given by the **cut set bound** described in the previous post. Here it is:

$$ B \leq \sum_{i=0}^{k-1} min \{ \alpha, (d-i) \beta \} $$.

Given this what can we consider "optimal"?  We're interested in minimizing both $$\alpha$$ and $$\beta$$ so naturally a good optimal would be to minimize one quantity for a fixed value of the other. Thus we say an $$(\alpha, \beta, B)$$ regenerating code is **optimal** if- 

1. $$(\alpha, \beta, B)$$ acheives the above bound with equality.
1. Decreasing either parameter will violate the bound.

### MSR and MBR
Given this, it is interesting to see what quantities we get when one of the parameters is fixed to be minimum. In case we want to see whats the best communication load we can incurr by storing the bare minimum, i.e. $$\alpha = \frac{B}{k}$$ we get $$\beta = \frac{B}{k(d-k+1)}$$. This is called the **Minimum Storage Regeneration (MSR) point**. 

If on the other hand we want to minimize communication at any cost of storage, we can set $$\beta = \frac{2B}{k(2d-k+1)}$$ and get $$\alpha = d\beta$$. This is called the **Minimum Bandwidth Regeneration (MBR) point**.

### Ignoring $$\beta$$
It turns out we can simplify our implementation by ignoring the parameter $$\beta$$. This seems unintuitive since $$\beta$$ is literally one of the parameters in the bound. However, consider this simple algorithm:

Given an optimal $$(\alpha, \beta, B)$$  code, we can construct an optimal $$(\delta \alpha, \delta \beta, \delta B)$$ for some $$\delta > 0$$. 

1. Divide the $$\delta B$$ symbols into  $$\delta$$ groups of $$B$$ symbols each.
1. Apply the $$(\alpha, \beta, B)$$ code independently on each group.
1. For each group store the $$n$$ encoded fragments in the $$n$$ nodes.

Now each node contains $$\delta$$ fragments each of $$\alpha$$ symbols. When a node fails, its replacement connects to any $$d$$ nodes, and reconstructs each group's fragment independently, each time incurring a cost of $$d \beta$$. Does this acheive the cut set bound with equality? Since $$(\alpha, \beta, B)$$ was optimal, $$ B = \sum_{i=0}^{k-1} min \{ \alpha, (d-i) \beta \} $$. Clearly multiplying both sides by $$\delta$$ shows that $$(\delta \alpha, \delta \beta, \delta B)$$ also satisfies this with equality. You can also check that they satisfy the MSR and MBR points. 

Thus if we can construct optimal codes for $$\beta = 1$$ we're done. Thus now our MSR Point becomes: $$ \alpha = d-k+1 $$ and $$ B = k(d-k+1) $$. and MBR point becomes: $$ \alpha = d$$ and $$ B = {kd- k \choose 2} $$. We also consider only values of $$d \geq k$$. This makes sense since otherwise the entire file could be recovered.

### Exact regeneration
Exact regeneration introduces an extra constraint into the repair process: we want the replacement node to be an exact replica of the failed node. This gives us a clear benefit: no change is required to applications that want to access the data. If this wasn't the case, we would have to inform other nodes of the changes and re tune our repair and recovery algorithms. 

## Product Matrix Framework
Our constructions are for a Linear Code. Thus our code is the rowspace of a generator matrix $$\Psi$$. A good way to represent the code is by an $$(n \times \alpha)$$ matrix $$C$$. This is because we can then simply assign the ith row to the ith node. In order to acheive this, we first arrange out message symbols into a matrix $$M$$. Thus-

$$ C = \Psi M $$.

Clearly $$\Psi$$ must have $$n$$ rows. It'll later become aparent that the construction requires $$\Psi$$ to have $$d$$ columns. This then makes $$M$$ a $$(d \times \alpha)$$ matrix. The actual symbols come from a finite field $$ F_q $$. 

## The MSR Construction
At the MSR point, $$\alpha = d-k+1$$ and $$ B = k(d-k+1)$$. We'll construct a code for $$ d = 2k-2 $$ and will later show how to extend it for larger $$d$$. Thus we have $$ \alpha = 2k-2 -k+1 = k-1$$ and $$ B = k \alpha = \alpha (\alpha+1) $$. So to arrange our message symbols into a $$ d \times \alpha = 2\alpha \times \alpha$$ matrix we let the matrix 

$$ M = \begin{bmatrix}
   S1  \\
   S2
\end{bmatrix}
$$

where $$S1$$ and $$S2$$ are $$ \alpha \times \alpha $$ symmetric matrices. Notice that each of them stores $$ \alpha \choose 2 + \alpha $$ or more simply $$ \alpha+1 \choose 2 $$ different symbols. Thus they totally store $$ 2 {\alpha+1 \choose 2} = \alpha (\alpha + 1) = B $$ symbols.

Now our encoding matrix $$ \Psi $$ is an $$(n \times d)$$ matrix of the form 

$$ \Psi = \begin{bmatrix}
   \Phi && \Lambda \Phi
\end{bmatrix}
$$

where $$\Phi$$ is an $$(n \times \alpha)$$ matrix and $$\Lambda$$ is an $$(n \times n)$$ diagonal matrix. This is because the encoded message will be 

$$ C = \begin{bmatrix}
   \Phi S1 +  \Lambda \Phi S2
\end{bmatrix}
$$

which is has the required $$(n \times \alpha)$$ dimension. 

