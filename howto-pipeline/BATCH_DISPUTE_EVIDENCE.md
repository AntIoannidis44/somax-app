# Gemini Batch API - cancelled job that was processed and billed

Billing account: 01EE90-AF800E-1F2CD0
Model: gemini-3-pro-image (Gemini API, Batch mode)
Job: `batches/ltrxwg3cet1d72kq2rlb7gqhsbd3pz3jhmak` (input file `files/u9iaegq195fg`, 512 requests)

All responses below are the Gemini API's own replies, recorded at the time by the client (timestamps from the client session log; AEDT = UTC+11).

| Time (AEDT, 18 Nov 2026) | Time (UTC) | Event | Gemini API response |
|---|---|---|---|
| 16:03:42 | 05:03:42 | Job created (512 requests) | `batches/ltrxwg3cet1d72kq2rlb7gqhsbd3pz3jhmak` |
| ~16:07 | ~05:07 | `POST .../batches/ltrxwg3cet1d72kq2rlb7gqhsbd3pz3jhmak:cancel` | `{}` (accepted) |
| 16:07:22 | 05:07:22 | `GET .../batches/ltrxwg3cet1d72kq2rlb7gqhsbd3pz3jhmak` immediately after cancelling | `"state": "BATCH_STATE_CANCELLED", "done": true, "stats": {"requestCount": "512", "pendingRequestCount": "512"}` |
| 16:07:58 | 05:07:58 | Replacement job created (`batches/p2vm165izqpv3qzo4b25h219povpdc2r9qf8`, 256 requests) - this one is not disputed | |
| 17:07:11 | 06:07:11 | `GET` of the cancelled job again | `"state": "BATCH_STATE_SUCCEEDED"`, `"successfulRequestCount": "473"`, `"failedRequestCount": "39"` |

## What happened
The job was cancelled through the API. The API accepted the cancellation and reported the job as `BATCH_STATE_CANCELLED` and `done: true` with all 512 requests still pending (none processed). The same job later reported `BATCH_STATE_SUCCEEDED` with 473 requests processed, and those requests were billed (approx. US$33.60 at batch image-output rates: 473 x 1,120 image tokens plus input/thinking tokens per the job's own usageMetadata).

## Request
Refund the charges for job `batches/ltrxwg3cet1d72kq2rlb7gqhsbd3pz3jhmak`. The cancellation was confirmed by the API before any request had been processed.
