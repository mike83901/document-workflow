using Example.DocumentApproval.Api.Models;

namespace Example.DocumentApproval.Api;

public sealed class DocumentStore
{
    private readonly object sync = new();
    private readonly List<DocumentItem> documents =
    [
        Create("FIN-2026-0184", "ใบเบิกค่าเดินทาง: เชียงใหม่", "การเงิน", "นภัส วัฒนกุล", -1, DocumentStatus.Pending),
        Create("HR-2026-0091", "คำขออนุมัติทำงานนอกสถานที่", "บุคคล", "กมลชนก ศรีสุข", -1, DocumentStatus.Pending),
        Create("PUR-2026-0067", "จัดซื้ออุปกรณ์สำนักงานประจำไตรมาส", "จัดซื้อ", "ธนกร พิพัฒน์", -2, DocumentStatus.Pending),
        Create("FIN-2026-0179", "ใบสำรองจ่าย: งานสัมมนาประจำปี", "การเงิน", "พิมพ์ชนก แสงทอง", -2, DocumentStatus.Pending),
        Create("MKT-2026-0038", "ขออนุมัติงบประชาสัมพันธ์", "การตลาด", "อรทัย มณีวงศ์", -3, DocumentStatus.Pending),
        Create("IT-2026-0122", "ต่ออายุใบอนุญาตซอฟต์แวร์", "เทคโนโลยี", "ศุภชัย บุญมี", -4, DocumentStatus.Approved, "ตรวจสอบงบประมาณแล้ว สามารถดำเนินการได้"),
        Create("FIN-2026-0168", "ใบเบิกค่าเดินทาง: ภูเก็ต", "การเงิน", "วราภรณ์ จันทร์ดี", -5, DocumentStatus.Approved, "เอกสารครบถ้วน อนุมัติตามระเบียบ"),
        Create("PUR-2026-0054", "ขอซื้อจอแสดงผลสำหรับห้องประชุม", "จัดซื้อ", "ปรีชา ใจดี", -6, DocumentStatus.Rejected, "กรุณาแนบใบเสนอราคาเพิ่มเติม")
    ];

    public IReadOnlyList<DocumentItem> GetAll()
    {
        lock (sync)
        {
            return documents.OrderByDescending(document => document.SubmittedAt).ToArray();
        }
    }

    public DocumentItem? Decide(Guid id, DocumentStatus status, string reason)
    {
        lock (sync)
        {
            var index = documents.FindIndex(document => document.Id == id);
            if (index < 0 || documents[index].Status != DocumentStatus.Pending)
            {
                return null;
            }

            var updated = documents[index] with
            {
                Status = status,
                DecisionReason = reason.Trim(),
                DecisionAt = DateTimeOffset.UtcNow
            };
            documents[index] = updated;
            return updated;
        }
    }

    private static DocumentItem Create(
        string number,
        string title,
        string category,
        string submittedBy,
        int daysAgo,
        DocumentStatus status,
        string? reason = null)
    {
        var submittedAt = DateTimeOffset.UtcNow.Date.AddDays(daysAgo).AddHours(9);
        return new DocumentItem(
            Guid.NewGuid(),
            number,
            title,
            category,
            submittedBy,
            submittedAt,
            status,
            reason,
            status == DocumentStatus.Pending ? null : submittedAt.AddHours(3));
    }
}