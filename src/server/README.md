# Servers and Services

A _Server_ is an entity that supports the Many protocol. The entity may be a
single machine or a group of machines operating together. Every Server responds
to the base methods of `endpoints`, `heartbeat`, and `status`.

A _Service_ is a specialized entity that extends a Server by responding to
specialized methods (like `ledger.info` in the case of a Ledger service).
