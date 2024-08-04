---
layout: post
title:  "Analyzing Markov Chains using Path Coupling"
date:   2021-02-11 00:18:23 +0700
categories: [MCMC, tcs]
---

In the [post on Analyzing Markov Chains using Coupling]({% post_url 2020-12-07-markov_chain_analysis_by_coupling %}), we saw a way to analyze how quickly a Markov Chain mixes by bounding the expected time taken by two arbitrary states to coalesce. 

But even in the simple example we saw there, we had to intelligently define the geometric random variables and carefully analyze them. Lets look at an even more powerful hammer: Path Coupling (courtesy of Bubley, Dyer).

As part of an MCMC reading group at IIITH during Spring 2021, I presented Coupling and Path Coupling as tools to analyze the mixing times of Markov Chains. These notes are (hopefully) self contained as long as you understand the basics of Markov Chains and Coupling. 


<object data="/static/pdf/Path Coupling Notes.pdf" width="100%" height="1000" type='application/pdf'/>

