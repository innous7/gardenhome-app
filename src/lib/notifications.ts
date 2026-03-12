"use server";

import { createClient } from "@/lib/supabase/server";

export async function createNotification(userId: string, type: string, title: string, message: string, link?: string) {
  const supabase = await createClient();
  await supabase.from("notifications").insert({ user_id: userId, type, title, message, link });
}

export async function getUnreadNotificationCount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);
  return count || 0;
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
}

// ── Notification helpers for specific events ──

/** 견적 요청 제출 시 → 승인된 모든 조경회사에 알림 */
export async function notifyNewQuoteRequest(quoteRequestId: string, projectType: string, location: string) {
  const supabase = await createClient();
  const { data: companies } = await supabase
    .from("companies")
    .select("user_id")
    .eq("is_approved", true);

  if (!companies) return;

  const notifications = companies.map((c) => ({
    user_id: c.user_id,
    type: "QUOTE_REQUEST",
    title: "새 견적 요청",
    message: `${location}에서 ${projectType} 견적 요청이 도착했습니다.`,
    link: `/partner/quotes`,
  }));

  if (notifications.length > 0) {
    await supabase.from("notifications").insert(notifications);
  }
}

/** 견적서 발송 시 → 고객에게 알림 */
export async function notifyQuoteSent(customerId: string, companyName: string, quoteRequestId: string) {
  await createNotification(
    customerId,
    "QUOTE_RECEIVED",
    "견적서 도착",
    `${companyName}에서 견적서를 보냈습니다.`,
    `/mypage/quotes/${quoteRequestId}`
  );
}

/** 견적 수락 시 → 조경회사에 알림 */
export async function notifyQuoteAccepted(companyUserId: string, customerName: string) {
  await createNotification(
    companyUserId,
    "QUOTE_RECEIVED",
    "견적 수락",
    `${customerName}님이 견적을 수락했습니다.`,
    `/partner/quotes`
  );
}

/** 계약 서명 시 → 상대방에 알림 */
export async function notifyContractSigned(targetUserId: string, signerName: string, contractId: string) {
  await createNotification(
    targetUserId,
    "CONTRACT_SIGNED",
    "계약서 서명 완료",
    `${signerName}님이 계약서에 서명했습니다.`,
    `/contracts/${contractId}`
  );
}

/** 프로젝트 상태 변경 시 → 고객에게 알림 */
export async function notifyProjectUpdate(customerId: string, projectTitle: string, newStatus: string) {
  const statusLabels: Record<string, string> = {
    IN_PROGRESS: "시공 시작",
    INSPECTION: "검수 요청",
    COMPLETED: "시공 완료",
  };
  await createNotification(
    customerId,
    "PROJECT_UPDATE",
    "프로젝트 상태 변경",
    `${projectTitle} 프로젝트가 "${statusLabels[newStatus] || newStatus}" 상태로 변경되었습니다.`,
    `/mypage/projects`
  );
}

/** 리뷰 작성 시 → 조경회사에 알림 */
export async function notifyNewReview(companyUserId: string, customerName: string, rating: number) {
  await createNotification(
    companyUserId,
    "REVIEW",
    "새 리뷰 등록",
    `${customerName}님이 ${rating.toFixed(1)}점 리뷰를 남겼습니다.`,
    `/partner/reviews`
  );
}

/** 회사 승인/거절 시 → 회사에 알림 */
export async function notifyCompanyApproval(companyUserId: string, approved: boolean, reason?: string) {
  await createNotification(
    companyUserId,
    "SYSTEM",
    approved ? "업체 승인 완료" : "업체 승인 거절",
    approved
      ? "축하합니다! 업체 승인이 완료되었습니다. 이제 서비스를 시작할 수 있습니다."
      : `업체 승인이 거절되었습니다.${reason ? ` 사유: ${reason}` : ""}`,
    approved ? "/partner/dashboard" : undefined
  );
}

/** 채팅 메시지 시 → 상대방에 알림 */
export async function notifyNewMessage(targetUserId: string, senderName: string, chatRoomId: string) {
  await createNotification(
    targetUserId,
    "MESSAGE",
    "새 메시지",
    `${senderName}님이 메시지를 보냈습니다.`,
    `/chat/${chatRoomId}`
  );
}
