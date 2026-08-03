import { colorOfUser, initialsOfUser } from "../_lib/format";
import type { WorkspaceUser } from "@/types/workspace";

export function Avatar({
  user,
  size = 34,
}: {
  user: WorkspaceUser | null | undefined;
  size?: number;
}) {
  return (
    <div
      className="ws-avatar"
      style={{ background: colorOfUser(user), width: size, height: size, fontSize: size * 0.4 }}
    >
      {initialsOfUser(user)}
    </div>
  );
}
