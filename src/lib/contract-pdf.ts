"use client";

import jsPDF from "jspdf";

type PaymentItem = { label: string; amount: number; status: string };

interface ContractData {
  id: string;
  status: string;
  total_amount: number;
  start_date: string | null;
  end_date: string | null;
  content: string;
  payment_schedule: PaymentItem[];
  warranty_terms: string;
  special_terms: string;
  customer_signature: string | null;
  company_signature: string | null;
  created_at: string;
  customer_name: string;
  customer_email: string;
  company_name: string;
  company_address: string;
  company_representative: string;
  company_phone: string;
}

// Korean characters need Unicode support - use built-in Helvetica with Korean text as images
// jsPDF doesn't natively support Korean, so we render Korean text via canvas and embed as images

function drawKoreanText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  fontSize: number = 10,
  fontWeight: string = "normal",
  color: string = "#111827",
  maxWidth?: number
): number {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const fontFamily = "Pretendard, -apple-system, 'Noto Sans KR', sans-serif";
  const weight = fontWeight === "bold" ? "700" : "400";
  ctx.font = `${weight} ${fontSize * 2}px ${fontFamily}`;

  // Handle multiline if maxWidth is given
  const lines: string[] = [];
  if (maxWidth) {
    const words = text.split("");
    let currentLine = "";
    for (const char of words) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width / 2 > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  } else {
    lines.push(text);
  }

  const lineHeight = fontSize * 1.5;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const metrics = ctx.measureText(line);
    const textWidth = Math.ceil(metrics.width / 2) + 4;
    const textHeight = Math.ceil(fontSize * 1.6);

    canvas.width = textWidth * 2;
    canvas.height = textHeight * 2;

    const ctx2 = canvas.getContext("2d")!;
    ctx2.scale(2, 2);
    ctx2.font = `${weight} ${fontSize}px ${fontFamily}`;
    ctx2.fillStyle = color;
    ctx2.textBaseline = "top";
    ctx2.fillText(line, 0, fontSize * 0.15);

    const imgData = canvas.toDataURL("image/png");
    doc.addImage(imgData, "PNG", x, y + i * lineHeight, textWidth, textHeight);
  }

  return y + lines.length * lineHeight;
}

export function generateContractPDF(contract: ContractData) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // ── Header ──
  doc.setDrawColor(34, 139, 34);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  y = drawKoreanText(doc, "조 경 시 공 계 약 서", 65, y, 18, "bold");
  y += 2;

  y = drawKoreanText(doc, `계약번호: ${contract.id.slice(0, 8).toUpperCase()}`, 72, y, 9, "normal", "#6B7280");
  y += 2;

  const dateStr = new Date(contract.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  y = drawKoreanText(doc, `계약일: ${dateStr}`, 80, y, 9, "normal", "#6B7280");
  y += 4;

  doc.setDrawColor(34, 139, 34);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ── Parties ──
  y = drawKoreanText(doc, "제1조  계약 당사자", margin, y, 12, "bold");
  y += 4;

  // Table for parties
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(249, 250, 251);
  doc.rect(margin, y, contentWidth, 28, "FD");
  doc.line(margin, y + 14, margin + contentWidth, y + 14);
  doc.line(margin + contentWidth / 2, y, margin + contentWidth / 2, y + 28);

  y = drawKoreanText(doc, "발주자 (갑)", margin + 3, y + 2, 8, "bold", "#6B7280");
  drawKoreanText(doc, "수급자 (을)", margin + contentWidth / 2 + 3, y - 8 * 1.5 - 2 + 2, 8, "bold", "#6B7280");

  y += 2;
  y = drawKoreanText(doc, contract.customer_name, margin + 3, y, 10, "normal");
  drawKoreanText(doc, contract.company_name, margin + contentWidth / 2 + 3, y - 10 * 1.5, 10, "normal");

  y += 2;
  y = drawKoreanText(doc, contract.customer_email, margin + 3, y, 8, "normal", "#6B7280");
  drawKoreanText(doc, `대표: ${contract.company_representative}`, margin + contentWidth / 2 + 3, y - 8 * 1.5, 8, "normal", "#6B7280");

  y += 8;

  // ── Contract Info ──
  y = drawKoreanText(doc, "제2조  공사 개요", margin, y, 12, "bold");
  y += 4;

  doc.setFillColor(249, 250, 251);
  doc.rect(margin, y, contentWidth, 20, "FD");

  const colW = contentWidth / 4;
  y = drawKoreanText(doc, "계약 금액", margin + 3, y + 2, 8, "normal", "#6B7280");
  drawKoreanText(doc, "착공일", margin + colW + 3, y - 8 * 1.5 - 2 + 2, 8, "normal", "#6B7280");
  drawKoreanText(doc, "완공일", margin + colW * 2 + 3, y - 8 * 1.5 - 2 + 2, 8, "normal", "#6B7280");
  drawKoreanText(doc, "상태", margin + colW * 3 + 3, y - 8 * 1.5 - 2 + 2, 8, "normal", "#6B7280");

  y += 2;
  const statusLabels: Record<string, string> = {
    DRAFT: "초안",
    REVIEW: "검토 중",
    PENDING_SIGN: "서명 대기",
    SIGNED: "계약 완료",
    COMPLETED: "시공 완료",
    CANCELLED: "취소",
  };

  y = drawKoreanText(doc, `${contract.total_amount?.toLocaleString()}원`, margin + 3, y, 10, "bold");
  const startD = contract.start_date
    ? new Date(contract.start_date).toLocaleDateString("ko-KR")
    : "미정";
  const endD = contract.end_date
    ? new Date(contract.end_date).toLocaleDateString("ko-KR")
    : "미정";
  drawKoreanText(doc, startD, margin + colW + 3, y - 10 * 1.5, 10, "normal");
  drawKoreanText(doc, endD, margin + colW * 2 + 3, y - 10 * 1.5, 10, "normal");
  drawKoreanText(doc, statusLabels[contract.status] || contract.status, margin + colW * 3 + 3, y - 10 * 1.5, 10, "normal");

  y += 10;

  // ── Payment Schedule ──
  y = drawKoreanText(doc, "제3조  대금 지급 조건", margin, y, 12, "bold");
  y += 4;

  const payments = contract.payment_schedule || [];
  // Table header
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, y, contentWidth, 8, "FD");
  drawKoreanText(doc, "구분", margin + 3, y + 1.5, 9, "bold");
  drawKoreanText(doc, "금액", margin + 90, y + 1.5, 9, "bold");
  drawKoreanText(doc, "상태", margin + 140, y + 1.5, 9, "bold");
  y += 8;

  for (const p of payments) {
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y + 8, margin + contentWidth, y + 8);
    drawKoreanText(doc, p.label, margin + 3, y + 1.5, 9, "normal");
    drawKoreanText(doc, `${p.amount?.toLocaleString()}원`, margin + 90, y + 1.5, 9, "normal");
    drawKoreanText(
      doc,
      p.status === "PAID" ? "지급완료" : "대기",
      margin + 140,
      y + 1.5,
      9,
      "normal",
      p.status === "PAID" ? "#16a34a" : "#6B7280"
    );
    y += 9;
  }

  y += 6;

  // ── Warranty ──
  if (contract.warranty_terms) {
    y = drawKoreanText(doc, "제4조  하자보수", margin, y, 12, "bold");
    y += 4;
    y = drawKoreanText(doc, contract.warranty_terms, margin + 3, y, 9, "normal", "#374151", contentWidth - 6);
    y += 6;
  }

  // ── Special Terms ──
  if (contract.special_terms) {
    y = drawKoreanText(doc, "제5조  특약사항", margin, y, 12, "bold");
    y += 4;
    y = drawKoreanText(doc, contract.special_terms, margin + 3, y, 9, "normal", "#374151", contentWidth - 6);
    y += 6;
  }

  // ── Standard Terms ──
  y = drawKoreanText(doc, "제6조  일반조건", margin, y, 12, "bold");
  y += 4;
  const generalTerms = [
    "1. 수급자는 계약 내용에 따라 성실히 시공하여야 한다.",
    "2. 시공 중 발생하는 안전사고에 대한 책임은 수급자에게 있다.",
    "3. 천재지변 등 불가항력으로 인한 공사 지연은 상호 협의하여 처리한다.",
    "4. 본 계약에 명시되지 않은 사항은 관련 법령 및 상관례에 따른다.",
  ];
  for (const term of generalTerms) {
    y = drawKoreanText(doc, term, margin + 3, y, 8.5, "normal", "#374151", contentWidth - 6);
    y += 1;
  }
  y += 6;

  // Check if need new page for signatures
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  // ── Signatures ──
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  y = drawKoreanText(doc, "서명", margin, y, 12, "bold");
  y += 6;

  // Signature boxes
  const sigBoxW = (contentWidth - 10) / 2;
  const sigBoxH = 30;

  // Customer signature
  drawKoreanText(doc, "발주자 (갑)", margin, y, 9, "bold", "#6B7280");
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin, y + 6, sigBoxW, sigBoxH);

  if (contract.customer_signature) {
    try {
      doc.addImage(contract.customer_signature, "PNG", margin + 5, y + 8, sigBoxW - 10, sigBoxH - 6);
    } catch {
      drawKoreanText(doc, "서명 완료", margin + 25, y + 18, 10, "normal", "#16a34a");
    }
  } else {
    drawKoreanText(doc, "미서명", margin + 30, y + 18, 10, "normal", "#9CA3AF");
  }

  // Company signature
  drawKoreanText(doc, "수급자 (을)", margin + sigBoxW + 10, y, 9, "bold", "#6B7280");
  doc.rect(margin + sigBoxW + 10, y + 6, sigBoxW, sigBoxH);

  if (contract.company_signature) {
    try {
      doc.addImage(contract.company_signature, "PNG", margin + sigBoxW + 15, y + 8, sigBoxW - 10, sigBoxH - 6);
    } catch {
      drawKoreanText(doc, "서명 완료", margin + sigBoxW + 35, y + 18, 10, "normal", "#16a34a");
    }
  } else {
    drawKoreanText(doc, "미서명", margin + sigBoxW + 40, y + 18, 10, "normal", "#9CA3AF");
  }

  y += sigBoxH + 14;

  // ── Footer ──
  doc.setDrawColor(34, 139, 34);
  doc.setLineWidth(0.5);
  doc.line(margin, 280, pageWidth - margin, 280);
  drawKoreanText(doc, "GardenHome(조경홈) | gardenhome-app.vercel.app", 55, 282, 8, "normal", "#9CA3AF");

  // Save
  const fileName = `계약서_${contract.id.slice(0, 8).toUpperCase()}_${
    new Date().toISOString().slice(0, 10)
  }.pdf`;
  doc.save(fileName);
}
