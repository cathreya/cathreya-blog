---
title: "Topics in Coding Theory: Reed Muller Codes"
draft: false
tags:
  - coding_theory
  - tcs
---
 
In Spring 2021, I did a course called Topics in Coding Theory by [Prof. Prasad Krishnan](https://faculty.iiit.ac.in/~prasad.krishnan/index.html). I thought I'll post some of my notes from the course here grouped by topic. Check out the previous posts on [[Berlekamp-Welch decoding]] and [[list decoding]]


Reed Muller codes are nifty codes that are based on evaluating a Multi-variate polynomial of bounded degree. Choosing the underlying field to be binary makes these really clean to study and implement. In the notes, we first look at how this code is defined. Then we look at some properties that help in decoding these codes (some of these aren't used in the algorithms we look at).

The first algorithm of interest is called Majority Logic Decoding. This uses some cool parity arguments to derive the coefficient of each monomial in descending order of degree. The algorithm itself is fairly simple and can be described in very few lines, but the theory behind why it works is quite interesting.

The second algorithm is for a special case where the degree of every monomial is one. In this case, we can manipulate the generator matrix to make it look like Hadamard Matrix! Then we use a well known idea called the Fast Hadamard Transform to generate compare codewords with the received vector.

I have coded up both these decoding algorithms. The implementation can be found [here](https://github.com/cathreya/cathreya.github.io/blob/master/static/notebooks/Reed-Muller-Codes.ipynb).![[ReedMuller.pdf]]