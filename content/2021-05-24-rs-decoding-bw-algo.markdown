---
layout: post
title:  "Topics in Coding Theory: RS Codes and the Berlekamp-Welch Algorithm"
date:   2021-05-25 00:18:23 +0700
categories: [coding_theory, tcs]
---

In Spring 2021, I did a course called Topics in Coding Theory by [Prof. Prasad Krishnan](https://faculty.iiit.ac.in/~prasad.krishnan/index.html). I thought I'll post some of my notes from the course here grouped by topic. 

Reed Solomon codes are fairly famous even outside of coding theory, but most courses simply show that they can be decoded and leave it at that. The issue arises when we don't know which pieces of the data have been corrupted. The Berlekamp-Welch algorithm uses an idea called an Error Locator Polynomial. Roughly, we can interpolate a polynomial that evaluates to zero at points where the received vector and transmitted vector mismatch. This gives us an equation $$ E(\alpha_i) \cdot M(\alpha_i) = E(\alpha_i) \cdot y_i $$ for each $$i$$. We can then model this as a system of equations that we can solve by, say, Gaussian Elimination. 

I also coded up this algorithm. The implementation can be found [here](https://github.com/cathreya/cathreya.github.io/blob/master/static/notebooks/Berlekamp-Welch%20Algorithm.ipynb).

<object data="/static/pdf/RS_Codes_BW_Algo.pdf" width="100%" height="1000" type='application/pdf'/>
