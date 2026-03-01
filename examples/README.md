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
- `end_to_end_projection_chain.test.ts`: run an end-to-end
  world->vehicle->camera->view->NDC pipeline.
- `safe_vs_unsafe_apis.test.ts`: contrast safe and unsafe behavior on valid and
  degenerate inputs.
- `quaternion_nlerp_vs_slerp.test.ts`: compare interpolation behavior of NLERP
  and SLERP.
- `normal_matrix_failure_recovery.test.ts`: show a practical fallback when
  normal-matrix construction fails.
- `projection_edge_behavior.test.ts`: check near/far edges, behind-camera
  projection, and `w = 0` handling.
- `cookbook_constant_accel_loop.test.ts`: demonstrate a unit-safe step loop for
  constant acceleration integration.
- `quat_from_rotation_matrix.test.ts`: recover a quaternion from a rotation
  matrix, read named components via `.x/.y/.z/.w` and `quatX/Y/Z/W`, and verify
  the safe variant rejects non-orthonormal matrices.
- `mat4_pose_decomposition.test.ts`: extract the translation column and
  orientation quaternion from a rigid-transform matrix via `.translation()` and
  `.quat()`, with a round-trip check and a rejection test for scale matrices.
- `distinct_frame_guard.test.ts`: show that `quat` and `mat4` constructors throw
  at runtime when the to-frame and from-frame tokens are identical.

## Conventions

- Angles are in radians.
- Matrices are stored in column-major order.
- `composeMat4(a, b)` means apply `b` first, then `a`.
- `mat4Perspective` in these examples targets NDC depth range `[-1, 1]`.
- Quantities are runtime numbers; unit safety is enforced at compile time.
- Prefer invariant checks (round-trips, orthogonality, expected vectors) over
  finiteness-only checks.
