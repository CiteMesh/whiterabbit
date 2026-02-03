# WRBT_01 Job State Machine

States
- queued
- processing
- done
- failed

Transitions
- queued → processing
- processing → done
- processing → failed

On failure, persist `error_code` and `error_message` for inspection.
