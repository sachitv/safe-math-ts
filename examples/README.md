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
- `sensor_extrinsics_chain.test.ts`: chain vehicle/lidar/camera extrinsics and
  verify lidar world round-trip.
- `transform_order_matters.test.ts`: show non-commutativity of rotation and
  translation composition.
- `transform_round_trip.test.ts`: verify rigid transform inversion by
  world-local-world round-trip.
- `transform_point_vs_direction.test.ts`: demonstrate translation effect on
  points vs directions.
- `normal_matrix_perpendicularity.test.ts`: verify normal matrix keeps normals
  perpendicular after non-uniform scale.
- `attitude_interpolation_and_cache.test.ts`: interpolate orientation with SLERP
  and reuse TRS transform cache results.
- `safe_api_failure_modes.test.ts`: demonstrate safe API validation failures for
  degenerate camera and vector inputs.

## Conventions

- Angles are in radians.
- `composeMat4(a, b)` means apply `b` first, then `a`.
- `mat4Perspective` in these examples targets NDC depth range `[-1, 1]`.
- Quantities are runtime numbers; unit safety is enforced at compile time.
- Prefer invariant checks (round-trips, orthogonality, expected vectors) over
  finiteness-only checks.
