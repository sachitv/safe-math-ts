# Examples

These are executable, test-backed examples. They are run automatically by
`deno test` from the repository root.

- `robotics_pose_chain.test.ts`: compose sensor and vehicle poses into a global
  localization transform.
- `camera_projection.test.ts`: transform world points into camera view and NDC.
- `physics_units_kinematics.test.ts`: solve constant-acceleration motion with
  compile-time unit safety.
- `rendering_normals_reflection.test.ts`: build normal matrices and reflect
  incident vectors.
- `attitude_interpolation_and_cache.test.ts`: interpolate orientation with SLERP
  and reuse TRS transform cache results.
