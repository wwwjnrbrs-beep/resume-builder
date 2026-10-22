import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ImageRun,
} from 'docx';
import { saveAs } from 'file-saver';

function base64ToUint8Array(base64) {
  if (!base64) return null;
  try {
    const raw = base64.replace(/^data:image\/\w+;base64,/, '');
    const binaryString = atob(raw);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error('Error converting base64 to uint8array', e);
    return null;
  }
}

export async function exportToDocx(resumeData, themeSettings) {
  const primaryHex = (themeSettings?.primaryColor || '#3E5566').replace('#', '');
  const secondaryHex = (themeSettings?.secondaryColor || '#56707F').replace('#', '');
  const font = themeSettings?.fontFamily?.includes('Merriweather')
    ? 'Georgia'
    : 'Calibri';

  const isSinglePage = themeSettings?.singlePage !== false;

  const docChildren = [];

  // Helper for Section Heading
  const createSectionHeading = (title) => {
    return new Paragraph({
      spacing: { before: isSinglePage ? 130 : 240, after: isSinglePage ? 40 : 100 },
      border: {
        bottom: {
          style: BorderStyle.SINGLE,
          size: 8,
          color: secondaryHex,
          space: 2,
        },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: isSinglePage ? 21 : 22, // 10.5pt vs 11pt
          color: primaryHex,
          font: font,
        }),
      ],
    });
  };

  // Header Table (Photo + Info)
  const headerCells = [];

  // If photo is enabled and present
  if (resumeData.personalInfo.showPhoto && resumeData.personalInfo.photo) {
    const imgBytes = base64ToUint8Array(resumeData.personalInfo.photo);
    if (imgBytes) {
      headerCells.push(
        new TableCell({
          width: { size: 22, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new ImageRun({
                  data: imgBytes,
                  transformation: {
                    width: 100,
                    height: 100,
                  },
                }),
              ],
            }),
          ],
        })
      );
    }
  }

  // Right cell: Name, Title, Contact
  const infoParagraphs = [
    new Paragraph({
      spacing: { before: 0, after: 40 },
      children: [
        new TextRun({
          text: resumeData.personalInfo.fullName || '',
          bold: true,
          size: 34, // 17pt
          color: primaryHex,
          font: font,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({
          text: resumeData.personalInfo.title || '',
          bold: true,
          size: 24, // 12pt
          color: secondaryHex,
          font: font,
        }),
      ],
    }),
  ];

  // Contact info row
  const contactParts = [];
  if (resumeData.personalInfo.location) contactParts.push(resumeData.personalInfo.location);
  if (resumeData.personalInfo.phone) contactParts.push(resumeData.personalInfo.phone);
  if (resumeData.personalInfo.email) contactParts.push(resumeData.personalInfo.email);

  if (contactParts.length > 0) {
    infoParagraphs.push(
      new Paragraph({
        spacing: { before: 0, after: 40 },
        children: [
          new TextRun({
            text: contactParts.join('  |  '),
            size: 20, // 10pt
            color: '444444',
            font: font,
          }),
        ],
      })
    );
  }

  // Additional links or relocation badge
  const extraContact = [];
  if (resumeData.personalInfo.relocation) extraContact.push(resumeData.personalInfo.relocation);
  if (resumeData.personalInfo.linkedin) extraContact.push(resumeData.personalInfo.linkedin);
  if (resumeData.personalInfo.github) extraContact.push(resumeData.personalInfo.github);

  if (extraContact.length > 0) {
    infoParagraphs.push(
      new Paragraph({
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: extraContact.join('  •  '),
            bold: true,
            size: 20,
            color: secondaryHex,
            font: font,
          }),
        ],
      })
    );
  }

  headerCells.push(
    new TableCell({
      width: {
        size: headerCells.length > 0 ? 78 : 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
      },
      children: infoParagraphs,
    })
  );

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: headerCells,
      }),
    ],
  });

  docChildren.push(headerTable);

  // 1. SUMMARY
  if (resumeData.summary) {
    docChildren.push(createSectionHeading('SUMMARY'));
    docChildren.push(
      new Paragraph({
        spacing: { before: isSinglePage ? 20 : 60, after: isSinglePage ? 50 : 120 },
        children: [
          new TextRun({
            text: resumeData.summary,
            size: isSinglePage ? 20 : 21, // 10pt vs 10.5pt
            color: '222222',
            font: font,
          }),
        ],
      })
    );
  }

  // 2. TECHNICAL SKILLS
  if (resumeData.skills && resumeData.skills.length > 0) {
    docChildren.push(createSectionHeading('TECHNICAL SKILLS'));
    resumeData.skills.forEach((skill) => {
      docChildren.push(
        new Paragraph({
          spacing: { before: isSinglePage ? 15 : 40, after: isSinglePage ? 15 : 40 },
          children: [
            new TextRun({
              text: `${skill.category}: `,
              bold: true,
              size: isSinglePage ? 20 : 21,
              color: '111111',
              font: font,
            }),
            new TextRun({
              text: skill.items,
              size: isSinglePage ? 20 : 21,
              color: '222222',
              font: font,
            }),
          ],
        })
      );
    });
  }

  // 3. EXPERIENCE
  if (resumeData.experience && resumeData.experience.length > 0) {
    docChildren.push(createSectionHeading('EXPERIENCE'));
    resumeData.experience.forEach((exp) => {
      // Role | Company
      docChildren.push(
        new Paragraph({
          spacing: { before: isSinglePage ? 40 : 100, after: 15 },
          children: [
            new TextRun({
              text: `${exp.role} | ${exp.company}`,
              bold: true,
              size: isSinglePage ? 21 : 22,
              color: primaryHex,
              font: font,
            }),
          ],
        })
      );

      // Period
      if (exp.period) {
        docChildren.push(
          new Paragraph({
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: exp.period,
                italics: true,
                size: 20,
                color: secondaryHex,
                font: font,
              }),
            ],
          })
        );
      }

      // Product description
      if (exp.product) {
        docChildren.push(
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({
                text: exp.product,
                size: 21,
                color: '333333',
                font: font,
              }),
            ],
          })
        );
      }

      // Highlights
      if (exp.highlights && exp.highlights.length > 0) {
        exp.highlights.forEach((hl) => {
          docChildren.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { before: 20, after: 20 },
              children: [
                new TextRun({
                  text: hl,
                  size: 21,
                  color: '222222',
                  font: font,
                }),
              ],
            })
          );
        });
      }
    });
  }

  // 4. EDUCATION
  if (resumeData.education && resumeData.education.length > 0) {
    docChildren.push(createSectionHeading('EDUCATION'));
    resumeData.education.forEach((edu) => {
      const headerLine = edu.year
        ? `${edu.school} – ${edu.year}`
        : edu.school;

      docChildren.push(
        new Paragraph({
          spacing: { before: 80, after: 20 },
          children: [
            new TextRun({
              text: headerLine,
              bold: true,
              size: 21,
              color: '111111',
              font: font,
            }),
          ],
        })
      );

      const detailParts = [];
      if (edu.degree) detailParts.push(edu.degree);
      if (edu.score) detailParts.push(edu.score);

      if (detailParts.length > 0) {
        docChildren.push(
          new Paragraph({
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: detailParts.join(' – '),
                size: 20,
                color: '444444',
                font: font,
              }),
            ],
          })
        );
      }
    });
  }

  // 5. LANGUAGES
  if (resumeData.languages && resumeData.languages.length > 0) {
    docChildren.push(createSectionHeading('LANGUAGES'));
    if (isSinglePage) {
      // Inline horizontal layout to guarantee 1-page fit
      const langRuns = [];
      resumeData.languages.forEach((lang, index) => {
        langRuns.push(
          new TextRun({
            text: lang.name,
            bold: true,
            size: 21,
            color: '222222',
            font: font,
          })
        );
        if (lang.proficiency) {
          langRuns.push(
            new TextRun({
              text: ` (${lang.proficiency})`,
              size: 20,
              color: '666666',
              font: font,
            })
          );
        }
        if (index < resumeData.languages.length - 1) {
          langRuns.push(
            new TextRun({
              text: '   •   ',
              size: 20,
              color: '888888',
              font: font,
            })
          );
        }
      });

      docChildren.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          children: langRuns,
        })
      );
    } else {
      resumeData.languages.forEach((lang) => {
        docChildren.push(
          new Paragraph({
            spacing: { before: 20, after: 20 },
            children: [
              new TextRun({
                text: lang.name,
                bold: true,
                size: 21,
                color: '222222',
                font: font,
              }),
              lang.proficiency
                ? new TextRun({
                    text: ` (${lang.proficiency})`,
                    size: 20,
                    color: '666666',
                    font: font,
                  })
                : null,
            ].filter(Boolean),
          })
        );
      });
    }
  }

  // 6. CERTIFICATIONS (if any)
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    docChildren.push(createSectionHeading('CERTIFICATIONS'));
    resumeData.certifications.forEach((cert) => {
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({
              text: cert.name,
              bold: true,
              size: 21,
              color: '222222',
              font: font,
            }),
            cert.issuer
              ? new TextRun({
                  text: ` – ${cert.issuer}`,
                  size: 20,
                  color: '444444',
                  font: font,
                })
              : null,
            cert.year
              ? new TextRun({
                  text: ` (${cert.year})`,
                  size: 19,
                  color: '666666',
                  font: font,
                })
              : null,
          ].filter(Boolean),
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 in
              right: 800,
              bottom: 720,
              left: 800,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanName = (resumeData.personalInfo.fullName || 'Resume')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '');
  saveAs(blob, `${cleanName}_Resume.docx`);
}
