---
layout: post
title:  "Analyzing Markov Chains using Coupling"
date:   2020-12-07 00:18:23 +0700
categories: [MCMC, tcs]
---

Consider the problem of sampling a binary string of length $$n$$ from the set of all binary strings of length $$n$$. An easy way to do this is to toss a coin $$n$$ times and choose the string suggested by the output of these coin tosses. But for exposition's sake lets try to do this using a Markov Chain.

Consider a Markov chain on the set of all strings of length $$n$$. For a string $$s$$, the transition is as follows:
1. Pick an index uniformly at random. $$ i \in_R \{1,2, \cdots, n\}$$.
2. Toss a coin. $$ r \in_R \{0,1\} $$
3. Set $$ s_i = r $$.

This transition graph is actually the boolean hypercube.

This Markov chain is clearly egodic:
a. Irreducible since any string can be transformed to any other string by flipping bits one at a time.
b. Aperiodic since with some probability the string remains unchanged. (A self loop in the transition graph).

This Markov chain also satisfies the detailed balance condition for the uniform distribution:
$$ \pi(x)P(x,y) = \pi(y)P(y,x) $$ since $$P(x,y) = P(y,x) $$ for all $$x,y \in \{0,1\}^n $$ where $$\pi(x)$$ is the stationary distribution and $$P(x,y)$$ is the transition probability of moving from state $$x$$ to state $$y$$.

Hence we can conclude that this Markov chain will indeed converge to the uniform distribution. But how many steps does it need to actually reach this distribution? This is an important question since our sampling algorithm would have to run this Markov chain for at least these many steps to be assured that the string we sampled is indeed distributed uniformly. 

The **mixing time** of a chain $$ \tau(\epsilon) $$ for $$ \epsilon > 0 $$ is given by 

$$ \tau(\epsilon) = min \{ t \vert \|P^{t\prime}, \pi\|_{tv} \leq \epsilon, \forall t\prime \geq t \} $$

where $$ \| P^{t\prime}, \pi \|_{tv} = max_{ x \in \Omega} \frac{1}{2} \sum_{y \in \Omega} \vert P^t(x,y) - \pi(y) \vert $$ is the total variation distance at time $$t$$. 

Intuitively, the total variation distance measures how far the distribution resulting from simulating the Markov chain for t steps is from stationary distribution $$\pi$$ for the worst initial state. Thus the mixing time denotes the time taken by the Markov chain to get "epsilon-close" to the desired distribution where closeness is given by the total variation distance.

A traditional way to analyze this mixing time would be to look at the spectral properties of the transition matrix. However here, and in most applications, the size of the transition graph (and hence its transition matrix) is exponential in the size of the string. Thus we're interested in some method to analyze the chain without having to rely on having the entire transition matrix.

Enter coupling. We define a coupling as a Markov chain on $$ \Omega \times \Omega $$ that defines a stochastic process $$(X_t, Y_t)_{t=0}^{\infty}$$ with the following properties:

1. Each of the processes $$X_t$$ and $$Y_t$$ when viewed in isolation is simulating the original chain.
2. If $$X_t = Y_t$$, then $$ X_{t+1} = T_{t+1} $$.

A way to visualize this is to consider two "particles" starting on different states of the original Markov chain. Each of these particles transition on the original Markov chain independently. However once both the particles end up at the same state in the same time step they coalesce and transition together.

For initial states $$x,y$$ let $$ T^{x,y} = min\{t \vert X_t = Y_t, X_0 = x, Y_0 = y \} $$, i.e. the time taken for this coalescence given the initial states. We define **coupling time** to be $$ T = max_{x,y} E[T^{x,y}]$$.

Now it turns out that (I'll save the proof for another post).

**Theorem:** $$\tau(\epsilon) \leq \lceil Teln(\epsilon^{-1}) \rceil$$. 

Back to our example - let $$d(X,Y)$$ be the Hamming distance between the strings X and Y. Consider any two starting vertices $$X_0, Y_0$$, and a coupling of the chain that updates both X and Y using the same $$i$$ and $$r$$, i.e. choose $$i$$ and $$r$$ at random update $$ X_i = Y_i = r$$. This is indeed a valid coupling since it satisfies both properties. Now notice that at each step, $$d(X,Y)$$ remains the same or reduces by 1. Therefore if each bit is chosen at least once, the two configurations will coalesce. In the worst case the two strings can have distance $$n$$ and thus every bit must be chosen at least once. Thus $$T = E[T^{X,Y}]$$ when $$d(X,Y)=n$$. 

So to find the coupling time we need to answer the question: given $$n$$ indices how many times do you expect to sample an index with replacement before having chosen each index at least once.

If you've taken an undergrad course in probability this should sound familiar: this is the [coupon collector's problem](https://en.wikipedia.org/wiki/Coupon_collector%27s_problem)!

Suppose $$t_i$$ is the time to choose the ith index after having chosen $$i-1$$ indices at least once, we are interested in $$T = E[t_1 + t_2 + \cdots + t_n]$$. By linearity of expectation this simply works out to be $$ E[t_1] + E[t_2] + \cdots + E[t_n] $$. Notice that each $$t_i$$ is a geometric random variable, hence $$ T = n \left( \frac{1}{1} + \frac{1}{2} + \frac{1}{3} + \cdots + \frac{1}{n} \right) = n \dot H_n = \Theta(nlog(n))$$.

Thus by the theorem, the Markov chain has mixing time $$ \tau(\epsilon) = O(nlogn \cdot eln(\epsilon^{-1})) = O(nlog (n\epsilon^{-1}))$$. Thus we can get arbitrarily close to the uniform distribution for only a logarithmic cost!




