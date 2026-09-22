---
title: How Turbopuffer makes retrieval pay-as-you-go
tags:
  - software
  - systems
date: 2026-07-22
---
Typically a retrieval system needs to keep an index in memory in order to make retrieval fast. When a query comes in, it can quickly look up this index to decide which documents to actually fetch from long term storage.

This makes retrieval very fast. The problem is that even if a term isn't searched, you pay for expensive compute nodes to keep its index entries in RAM. If you have a corpus of 1M documents with billions of terms and your most frequent queries fetch only 5% of them, you still rent RAM for the remaining 95% even though they're fetched much less frequently. [Turbopuffer](https://turbopuffer.com/) is a retrieval system that lets you pay based on actual usage rather than corpus size.

The key insight is that you can separate the actual storage layer from the performance layer.

The index layer lives in object storage along with the actual documents to retrieve. The index itself is hierarchical where each level informs which level to fetch next with the leaf nodes containing the actual documents.

When a query comes in, the compute layer fetches the required index shards from object storage level-by-level till it eventually fetches the required documents. With 4-5 network calls to object storage, a query over a corpus of say 1M documents can be answered in about 500ms.

The performance layer is separate. Active keys and their corresponding index entries are cached in either memory or NVMe automatically based on what is actually being queried. Once the cache is warmed, these queries can be answered with ~15ms latency. 

By doing this, if you have keys that are not fetched often, you don't pay for expensive compute, you only pay for the much cheaper object storage. And if you do have active keys, these are stored in memory for faster retrieval. You can use the cache size as a knob to tradeoff between compute and latency, effectively allowing you to pay based on usage.