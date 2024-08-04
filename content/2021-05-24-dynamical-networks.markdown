---
layout: post
title:  "Dynamical Systems on Networks"
date:   2021-05-24 00:18:23 +0700
categories: [dynamics]
---

In Spring 21, I did a course on Nonlinear Dynamics by [Prof. Vinod P K](https://faculty.iiit.ac.in/~vinod.pk/). The final project was to analyze a dynamical or chaotic system. In class, we covered mostly systems in at most two dimensions, sometimes three. In the project I wanted to explore systems with more dimensions. But in such systems it may not be the case that every variable affects every other variable. These systems are modelled as networks, where the vertices are these system variables and the edges denote that one influences the other. This idea is explored in my report.

An interesting case is when the entire network isn't available, either because the data is simply unknown or because it is computationally infeasible to handle the entire network. In such cases Mean Field approximation is used to get estimates. This has also been explored in the report. 

I wrote code trying to recreate results for small networks. The Julia Jupyer Notebook can be found [here](https://github.com/cathreya/cathreya.github.io/blob/master/static/notebooks/NLD_Project.ipynb).

<object data="/static/pdf/NLD_Project_Report.pdf" width="100%" height="1000" type='application/pdf'/>
