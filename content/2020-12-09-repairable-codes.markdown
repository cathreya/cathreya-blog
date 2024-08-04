---
layout: post
title:  "Regenerating Codes"
date:   2020-12-12 00:18:23 +0700
categories: [coding_theory, tcs]
---
I was reading a paper titled ["Network Coding for Distributed Storage Systems"](https://users.ece.utexas.edu/~dimakis/RC_Journal.pdf) by Dimakis et. al. Here I'll try to present some of the main theoretical ideas proposed. **Note:** This is **not** my work, I just use the word "our" to make it easier for me to communicate some ideas. 

## Motivation
The usual goal of an erasure code is recover from as many data erasures as possible. Thus these codes try to tradeoff the number of erasures that can be recovered from with the number of blocks stored. Indeed, MDS codes (like the famous Reed-Solomon code) acheive the optimal trade off between redundancy (extra information stored) and reliability (the number of erasures that can be tolerated). Thus in a distributed system, a file of size $$\mathcal{M}$$ can be split into $$k$$ pieces each having equal size $$\frac{\mathcal{M}}{k}$$ and encoded into $$n$$ encoded fragments (of the same size) using an $$(n,k)$$ MDS code and store them in $$n$$ nodes. Now the original file can be recovered by querying any $$k$$ of the $$n$$ nodes. The redundancy-reliability tradeoff implies that to tolerate $$n-k$$ block erasures, $$k$$ encoded fragments each of size $$\frac{\mathcal{M}}{k}$$ is the minimum for recovering the file.

In distributed systems, nodes may leave the system for a variety of reasons, most notably failure. In such a case, a replacement node must be added and the redundancy refereshed so that querying any $$k$$ nodes can still allow us to recover the original file. Now the straightforward way to acheive this would be for the new node to query any of $$k$$ active nodes that are still in the system, reconstruct the entire file and then construct a new encoded fragment for itself. However, it seems rather wasteful to have to reconstruct the entire file of size $$\mathcal{M}$$ just to create an encoded fragment of size $$\frac{\mathcal{M}}{k}$$. This cost can be thought of as the **"repair bandwidth"**. More formally, given a code that breaks a file into $$n$$ encoded fragments that can recover it using any $$k$$ fragments, the repair bandwidth is the total number of bits transfered in the system to create a new encoded fragment. 

## Tradeoff
Obviously, this doesn't come for free, if we can still recover the file from any $$k$$ of the $$n$$ fragments and at the same time generate a new fragment by transfering less than $$\mathcal{M}$$ across the system, we must pay somewhere for it to work. It turns out that this payment appears is in the form of larger fragment sizes. Thus we have a new tradeoff we can look at - storage vs repair bandwidth. *Spoiler Alert*: it turns out there is an **optimal tradeoff curve** with our good old MDS codes at one extreme and a new class of codes at the other. The MDS codes are **Minimum Storage Regenerating (MSR)** codes: they acheive the optimal storage - repair bandwidth tradeoff when storage is minimum (its amazing to me how MDS codes are optimal here as well!). The ones at the other extreme are called **Minimum Bandwidth Regenerating (MBR)** codes: these acheive the optimal tradeoff when repair bandwidth is minimum (and hence storage is maximum).

So what actually is the tradeoff? Let $$\alpha$$ be the amount of data stored in each node. Now suppose a new node that joins connects to $$d$$ active nodes and downloads $$\beta$$ bits from each of them. Lets denote the total data transfered to be $$\gamma = d\beta$$. Our main theorem is that if you want to acheive a code $$(n,k,d,\alpha,\gamma)$$ then $$\alpha \geq \alpha^*(n,k,d,\gamma)$$. What is $$\alpha^*$$ you ask? Well, its not pretty- 

![Theorem 1](/static/img/repbandthm.png)

Wow, that looks super convoluted doesn't it? The proof, though, is surprisingly elegant and will clear a lot of things up. (The $$\gamma \in [f(0),+\infty]$$ still remains a mystery to me though, please let me know if you figure it out)

## MSR and MBR
Before we get into the proof lets again look at the two extremums. The redundancy - reliability optimality implies that the minimum $$\alpha$$ to recover a file of size $$\mathcal{M}$$ from any $$k$$ of $$n$$ fragments is $$ \alpha = \frac{\mathcal{M}}{k}$$. Applying the theorem, we see that $$\gamma = f(0) = \frac{\mathcal{M}d}{k(d-k+1)}$$. In our good old MDS codes $$d=k$$. You can easily verify that in that case $$\gamma = \mathcal{M}$$. However, $$\gamma$$ decreases with larger $$d$$, hence $$\gamma_{min} = \frac{\mathcal{M}}{k} \cdot \frac{n-1}{n-k}$$ This means that MSR codes will have to transfer an $$\frac{n-1}{n-k}$$ factor more than they store. On the other extremum, substituting $$\gamma = f(k-1) = \frac{2\mathcal{M}d}{2kd-k^2+k}$$ into the theorem in fact gives us $$\alpha = \frac{2\mathcal{M}d}{2kd-k^2+k}$$. Thus they need to only transfer as much as they store! Again setting $$d=n-1$$, $$\alpha = \gamma = \frac{\mathcal{M}}{k} \cdot \frac{2n-2}{2n-k-1}$$. Hence these MBR codes require to store a factor of $$\frac{2n-2}{2n-k-1}$$ extra over the optimal $$\frac{\mathcal{M}}{k}$$.

## Proof
To be added