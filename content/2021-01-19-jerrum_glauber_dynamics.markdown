---
layout: post
title:  "Glauber Dynamics is rapid mixing for k > 2Δ"
date:   2021-01-19 00:18:23 +0700
categories: [MCMC, tcs]
---

Glauber Dynamics is a well studied Markov Chain to sample k-colorings of a graph. However, a basic coupling/path coupling analysis of Glauber Dynamics requires $$k > 3\Delta$$ for the chain to be rapid mixing. However, it is hypothesized (and intuitive) that the chain should be rapid mixing for any $$k > \Delta + 2 $$. Bringing this gap down is a popular open problem. [Jerrum](https://www.math.cmu.edu/~af1p/Teaching/MCC17/Papers/colorJ.pdf) used an extremely clever coupling to bring it down to $$ k > 2\Delta $$. Here I'll give a simple path coupling proof that uses the same idea.

## Glauber Dynamics
The Glauber Dynamics chain $$\sigma_t$$ works as follows:
1. Choose $$ v \in_R V $$ and $$ c \in_R C$$, where $$V$$ is the vertex set and $$C$$ is the set of colors.
1. If $$c \notin \{ \sigma_t(w) : w \in N(v) \} $$, set $$\sigma_{t+1}(v) = c$$ and $$\sigma_{t+1}(w) = \sigma_{t}(w)$$ for all $$ w \neq v$$. Here $$N(v)$$ is the set of neighbors of $$v$$.
1. Else set $$\sigma_{t+1}(w) = \sigma_{t}(w)$$ for all $$w \in V$$.

## Path Coupling
For a metric $$d$$ defined on the state space, such that for any pair of states $$x_t, y_t \in \Omega$$, there exists a path $$x_t = z_0, z_1, \cdots, z_r = y_t$$ where $$\sum_{i=0}^{r-1} d(z_i,z_{i+1}) = d(x_t, y_t)$$. The path coupling theorem implies that if for each pair of states $$x_0, y_0$$ such that $$d(x_0, y_0) = 1$$, if $$ E[d(x_1, y_1)] \leq \beta d(x_0, y_0)$$ for some $$ 0 < \beta < 1$$, the the mixing time satisfies 

$$\tau_{mix}(\epsilon) \leq \frac{log(D) - log(\epsilon)}{log(\beta^{-1})}$$.

where $$D$$ is maximum value taken by the metric.

## Jerrum's Coupling
Choose $$d(\sigma,\tau)$$ to be the number of vertices where the colorings differ. Consider $$(\sigma_0, \tau_0)$$ that differ exactly at a single vertex $$u$$. The maximum value $$d$$ can take is $$n$$ since the two colorings can differ at all vertices. Jerrum's coupling does the following:
1. Choose $$ v \in_R V $$ and $$ c \in_R C$$.
1. If $$c \notin \{ \sigma_t(w) : w \in N(v) \} $$, set $$\sigma_{t+1}(v) = c$$ and $$\sigma_{t+1}(w) = \sigma_{t}(w)$$ for all $$ w \neq v$$.
1. Else set $$\sigma_{t+1}(w) = \sigma_{t}(w)$$ for all $$w \in V$$.
1. If $$f(c) \notin \{ \sigma_t(w) : w \in N(v) \} $$, set $$\sigma_{t+1}(v) = f(c)$$ and $$\sigma_{t+1}(w) = \sigma_{t}(w)$$ for all $$ w \neq v$$. Here $$N(v)$$ is the set of neighbors of $$v$$.
1. Else set $$\sigma_{t+1}(w) = \sigma_{t}(w)$$ for all $$w \in V$$.

Where 
$$
f(c) = \begin{cases}
   \sigma_t(u) &\text{if } c = \tau_t(u) \\
   \tau_t(u) &\text{if } c = \sigma_t(u) \\
   c &\text{otherwise}
\end{cases}
$$.

It is simple to see that this is indeed a coupling. Each chain when viewed in isolation evolves exactly like Glauber Dynamics. In order to bound $$ E[d(\sigma_1, \tau_1)]$$ lets look at the possible cases.

- $$v \neq u$$ and $$v \notin N(u) $$: Here the update either goes through in both chains or neither chain. In both these cases the distance does not change.
- $$v = u$$: Here if the update goes through, it does so in both chains and the distance decreases by 1. However if it doesn't go through in one chain, it doesn't in the other as well and so the distance does not change. The update goes through with probability at least $$\frac{(k-\Delta)}{nk}$$ since in the worst case, $$u$$ has $$\Delta$$ neighbours each with their unique color.
- $$v \in N(u)$$: Here, if $$c = \sigma_t(u)$$ the update doesn't go through in either chain since $$f(c) = \tau_t(u)$$. However, if $$c = \tau_t(u)$$ a **different** update goes through in both the chains: $$\sigma_{t+1}(v) = \tau_t(u)$$ and $$\tau_{t+1}(v) = \sigma_t(u)$$. This causes the distance to *increase* by 1. This occurs with probabilty $$ \frac{\Delta}{nk}$$. 

Thus, $$ E[d(x_1, y_1)] \leq 1 -1 \frac{k-\Delta}{nk} + 1 \frac{\Delta}{nk} $$. Simplifying this gives us $$ 1 - \frac{2\Delta-k}{nk}$$. Since $$ 1+x \leq e^x$$, $$E[d(x_1, y_1)] \leq e^{\frac{2\Delta-k}{nk}}$$. For this quantity to be between 0 and 1, $$2\Delta - k < 0$$. Hence if $$k > 2\Delta$$, by the Path Coupling Theorem, $$ \tau_{mix}(\epsilon) \leq \frac{log(n) - log(\epsilon)}{\frac{1}{nk}} $$. Therefore Glauber Dynamics mixes in time $$O(nk log(n\epsilon^{-1}))$$.
