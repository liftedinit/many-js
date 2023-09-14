import { EventType, EventTypeIndices } from "./network/modules/types"

export const HIGH_WATER_MARK = 5242880 // 5MB

export const ONE_SECOND = 1000
export const ONE_MINUTE = 60 * ONE_SECOND

export const eventTypeNameToIndices: {
  [key in EventType]: EventTypeIndices
} = {
  [EventType.send]: [6, 0],
  [EventType.kvstorePut]: [7, 0],
  [EventType.kvstoreDisable]: [7, 1],
  [EventType.accountCreate]: [9, 0],
  [EventType.accountSetDescription]: [9, 1],
  [EventType.accountAddRoles]: [9, 2],
  [EventType.accountRemoveRoles]: [9, 3],
  [EventType.accountDisable]: [9, 4],
  [EventType.accountAddFeatures]: [9, 5],
  [EventType.accountMultisigSubmit]: [9, [1, 0]],
  [EventType.accountMultisigApprove]: [9, [1, 1]],
  [EventType.accountMultisigRevoke]: [9, [1, 2]],
  [EventType.accountMultisigExecute]: [9, [1, 3]],
  [EventType.accountMultisigWithdraw]: [9, [1, 4]],
  [EventType.accountMultisigSetDefaults]: [9, [1, 5]],
  [EventType.accountMultisigExpired]: [9, [1, 6]],
  [EventType.mint]: [12, 0],
  [EventType.burn]: [12, 1],
  [EventType.kvstoreTransfer]: [13, 0],
  [EventType.webDeploy]: [17, 0],
  [EventType.webRemove]: [17, 1],
}
