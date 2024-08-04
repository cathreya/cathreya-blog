---
layout: post
title:  "Topics in Coding Theory: List Decoding of RS Codes"
date:   2021-05-26 00:18:23 +0700
categories: [coding_theory, tcs]
---

In Spring 2021, I did a course called Topics in Coding Theory by [Prof. Prasad Krishnan](https://faculty.iiit.ac.in/~prasad.krishnan/index.html). I thought I'll post some of my notes from the course here grouped by topic. Check out the previous posts on [Berlekamp-Welch decoding]({% post_url 2021-05-24-rs-decoding-bw-algo %}).

A natural relaxation to the decoding problem is to remove the need to output a single candidate codeword. In the case of list decoding, we allow the decoder to output a *list* of candidate codewords. We consider the list decoding to be correct as long as one of the codewords in the list is the transmitted codeword. 

Naturally, we are interested in lists of polynomial length. This could enable us to do a brute force search on these codewords for example. Thus we parameterize list decodability by a tuple $$ (\rho, L) $$. $$ \rho$$  characterizes how far away a candidate can be from the received codeword. $$L$$ is the list length. Johnson's bound gives us a constraint on $$\rho$$ for which the list size $$L$$ is bounded by $$O(n^2)$$.

Finally we explore three algorithms for List Decoding. Each algorithm build upon the previous one and gets closer and closer to acheiving Johnson's bound.

In case you prefer LaTeX, I have the last lecture (with the third algorithm) scribed [here.](/static/pdf/TCT_Lec_10_Scribe.pdf)


<object data="/static/pdf/ListDecoding.pdf" width="100%" height="1000" type='application/pdf'/>
