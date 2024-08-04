---
layout: post
title:  "Flip Dynamics"
date:   2021-02-11 00:18:23 +0700
categories: [MCMC, tcs]
---

Glauber Dynamics is a well studied Markov Chain to sample k-colorings of a graph. However, a basic coupling/path coupling analysis of Glauber Dynamics requires $$k > 3\Delta$$ for the chain to be rapid mixing. However, it is hypothesized (and intuitive) that the chain should be rapid mixing for any $$k > \Delta + 2 $$. Bringing this gap down is a popular open problem. [Jerrum](https://www.math.cmu.edu/~af1p/Teaching/MCC17/Papers/colorJ.pdf) used an extremely clever coupling to bring it down to $$ k > 2\Delta $$. 

[Vigoda](https://www.cc.gatech.edu/~vigoda/coloring.ps) takes a totally different approach. He defines a completely new Markov Chain called Flip Dynamics and proves that it is rapid mixing under the condition that $$ k > \frac{11 \Delta}{6}$$. He then makes use of a comparison theorem, courtesy Diaconis and Saloff-Coste, to then prove that Glauber Dynamics is also rapid mixing.

Here are the notes I took while reading his wonderful paper. **Unlike my other posts these notes aren't of very high quality.** However I decided to put them here as a placeholder while I find the time to refine them into a proper blog post.

<object data="/static/pdf/Vigoda Chain.pdf" width="100%" height="1000" type='application/pdf'/> 


