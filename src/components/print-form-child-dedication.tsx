'use client';

import { forwardRef } from 'react';

interface FormData {
  namaAnak?: string;
  namaPanggilan?: string;
  jenisKelaminAnak?: string;
  tempatLahirAnak?: string;
  tanggalLahirAnak?: string;
  alamat?: string;
  rtRw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  kodePos?: string;
  noTelepon?: string;
  cabangIbadah?: string;
  namaAyah?: string;
  namaIbu?: string;
  tanggalPenyerahan?: string;
  penyerahanDilakukanOleh?: string;
}

interface Props {
  data: FormData;
  nomor?: string;
}

function formatDate(raw?: string): string {
  if (!raw) return '';
  if (raw.includes(',') || /[A-Za-z]/.test(raw)) return raw;
  const [y, m, d] = raw.split('-').map(Number);
  if (!y || !m || !d) return raw;
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function gender(val?: string): string {
  if (!val) return '';
  return val === 'Laki-laki' ? 'L' : 'P';
}

const PrintFormChildDedication = forwardRef<HTMLDivElement, Props>(
  function PrintFormChildDedication({ data, nomor }, ref) {
    const d = data;

    return (
      <div ref={ref} className="print-form-pa">
        <style>{`
          .print-form-pa {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            color: #000;
            background: #fff;
            width: 210mm;
            min-height: 297mm;
            padding: 12mm 16mm;
            box-sizing: border-box;
            line-height: 1.6;
          }

          /* Header */
          .pf-header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
            margin-bottom: 16px;
            position: relative;
          }
          .pf-header-logo {
            position: absolute;
            left: 0;
            top: 0;
            width: 64px;
            height: 64px;
          }
          .pf-header h1 {
            font-size: 18pt;
            font-weight: bold;
            margin: 0 0 2px;
            letter-spacing: 2px;
          }
          .pf-header .pf-legal {
            font-size: 7.5pt;
            line-height: 1.3;
            margin: 0;
          }
          .pf-header .pf-addr {
            font-size: 7.5pt;
            line-height: 1.3;
            margin: 2px 0 0;
          }
          .pf-header .pf-branch {
            font-size: 10pt;
            font-weight: bold;
            margin: 2px 0 0;
          }

          /* Title */
          .pf-title {
            text-align: center;
            margin: 16px 0 20px;
          }
          .pf-title h2 {
            font-size: 14pt;
            font-weight: bold;
            border: 2px solid #000;
            display: inline-block;
            padding: 4px 16px;
          }

          /* Fields */
          .pf-fields {
            margin: 0;
          }
          .pf-row {
            display: flex;
            align-items: baseline;
            margin-bottom: 4px;
            min-height: 24px;
          }
          .pf-label {
            width: 220px;
            flex-shrink: 0;
            font-size: 11pt;
            text-transform: uppercase;
          }
          .pf-colon {
            width: 16px;
            text-align: center;
            flex-shrink: 0;
          }
          .pf-value {
            flex: 1;
            border-bottom: 1px dotted #666;
            padding-bottom: 1px;
            min-height: 18px;
            font-size: 11pt;
          }
          .pf-sub-row {
            display: flex;
            align-items: baseline;
            margin-bottom: 3px;
            padding-left: 236px;
          }
          .pf-sub-label {
            width: 100px;
            flex-shrink: 0;
            font-size: 10pt;
            text-transform: uppercase;
          }
          .pf-sub-colon {
            width: 16px;
            text-align: center;
            flex-shrink: 0;
          }
          .pf-sub-value {
            flex: 1;
            border-bottom: 1px dotted #666;
            padding-bottom: 1px;
            min-height: 16px;
            font-size: 10pt;
          }

          /* Footer sections */
          .pf-footer {
            margin-top: 24px;
            display: flex;
            gap: 32px;
          }
          .pf-requirements {
            flex: 1;
          }
          .pf-requirements h3, .pf-notes h3 {
            font-size: 10pt;
            font-weight: bold;
            text-decoration: underline;
            margin: 0 0 4px;
          }
          .pf-requirements ul, .pf-notes ul {
            font-size: 9pt;
            margin: 0;
            padding-left: 16px;
            line-height: 1.5;
          }
          .pf-signature {
            text-align: center;
            min-width: 180px;
          }
          .pf-signature .pf-date {
            font-size: 10pt;
            margin-bottom: 60px;
          }
          .pf-signature .pf-line {
            border-top: 1px solid #000;
            width: 160px;
            margin: 0 auto 2px;
          }
          .pf-signature .pf-sig-label {
            font-size: 9pt;
          }
          .pf-notes {
            margin-top: 12px;
          }

          @media print {
            .print-form-pa {
              margin: 0;
              padding: 10mm 14mm;
            }
          }
        `}</style>

        {/* Header */}
        <div className="pf-header">
          <h1>GEREJA BETHEL INDONESIA</h1>
          <p className="pf-legal">
            Badan Hukum Gereja: SK Dirjen Bimas Kristen/Protestan Departemen Agama RI No. 41 Th 1972 dan<br />
            SK Dirjen Bimas Kristen/Protestan Departemen Agama RI No. 211 Tahun 1989 Tgl 25 November 1989
          </p>
          <p className="pf-branch">Jl. Sukawarna, Komp. Istana Regensi I Kav. C3/1 Bandung</p>
          <p className="pf-addr">
            Sekretariat : Jl. Aruna No. 19, Bandung 40174 - Telp. (62 22) 6003808, 6007166, 6011218, 6012013<br />
            Fax. (62 22) 6012394 (Sekum), 6009231 (Cool) - Email. gbisukawarna@gbisukawarna.org<br />
            Website. www.gbisukawarna.org
          </p>
        </div>

        {/* Title */}
        <div className="pf-title">
          <h2>FORMULIR PENYERAHAN ANAK</h2>
        </div>

        {/* Form fields */}
        <div className="pf-fields">
          <div className="pf-row">
            <span className="pf-label">Nomor (Diisi Sekretariat)</span>
            <span className="pf-colon">:</span>
            <span className="pf-value">{nomor || ''}</span>
          </div>

          <div className="pf-row">
            <span className="pf-label">Nama Lengkap (Anak)</span>
            <span className="pf-colon">:</span>
            <span className="pf-value">{d.namaAnak || ''}</span>
          </div>

          <div className="pf-row">
            <span className="pf-label">Nama Panggilan</span>
            <span className="pf-colon">:</span>
            <span className="pf-value">
              {d.namaPanggilan || ''}
              <span style={{ float: 'right' }}>({gender(d.jenisKelaminAnak) || 'L/P'})</span>
            </span>
          </div>

          <div className="pf-row">
            <span className="pf-label">Alamat Lengkap</span>
            <span className="pf-colon">:</span>
            <span className="pf-value">{d.alamat || ''}</span>
          </div>

          <div className="pf-sub-row">
            <span className="pf-sub-label">RT/RW</span>
            <span className="pf-sub-colon">:</span>
            <span className="pf-sub-value">{d.rtRw || ''}</span>
          </div>
          <div className="pf-sub-row">
            <span className="pf-sub-label">Kelurahan</span>
            <span className="pf-sub-colon">:</span>
            <span className="pf-sub-value">{d.kelurahan || ''}</span>
          </div>
          <div className="pf-sub-row">
            <span className="pf-sub-label">Kecamatan</span>
            <span className="pf-sub-colon">:</span>
            <span className="pf-sub-value">{d.kecamatan || ''}</span>
          </div>
          <div className="pf-sub-row">
            <span className="pf-sub-label">Kota</span>
            <span className="pf-sub-colon">:</span>
            <span className="pf-sub-value">{d.kota || ''}</span>
          </div>
          <div className="pf-sub-row">
            <span className="pf-sub-label">Kode Pos</span>
            <span className="pf-sub-colon">:</span>
            <span className="pf-sub-value">{d.kodePos || ''}</span>
          </div>
          <div className="pf-sub-row">
            <span className="pf-sub-label">HP</span>
            <span className="pf-sub-colon">:</span>
            <span className="pf-sub-value">{d.noTelepon || ''}</span>
          </div>

          <div className="pf-row" style={{ marginTop: 8 }}>
            <span className="pf-label">Cabang Ibadah</span>
            <span className="pf-colon">:</span>
            <span className="pf-value">{d.cabangIbadah || ''}</span>
          </div>

          <div className="pf-row">
            <span className="pf-label">Tempat/Tanggal Lahir</span>
            <span className="pf-colon">:</span>
            <span className="pf-value">
              {[d.tempatLahirAnak, formatDate(d.tanggalLahirAnak)].filter(Boolean).join(', ')}
            </span>
          </div>

          <div className="pf-row">
            <span className="pf-label">Nama Ayah</span>
            <span className="pf-colon">:</span>
            <span className="pf-value">{d.namaAyah || ''}</span>
          </div>

          <div className="pf-row">
            <span className="pf-label">Nama Ibu</span>
            <span className="pf-colon">:</span>
            <span className="pf-value">{d.namaIbu || ''}</span>
          </div>

          <div className="pf-row">
            <span className="pf-label">Tanggal Penyerahan</span>
            <span className="pf-colon">:</span>
            <span className="pf-value">{formatDate(d.tanggalPenyerahan)}</span>
          </div>

          <div className="pf-row">
            <span className="pf-label">Penyerahan Dilakukan Oleh</span>
            <span className="pf-colon">:</span>
            <span className="pf-value">{d.penyerahanDilakukanOleh || ''}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pf-footer">
          <div>
            <div className="pf-requirements">
              <h3>Persyaratan:</h3>
              <ul>
                <li>Phas Foto Anak ukr. 3x4 dua lembar.</li>
                <li>Foto Copy Akta Lahir Anak.</li>
                <li>Foto Copy Surat Baptisan Ayah dan Ibu.</li>
                <li>Foto Copy Akta Nikah / Pemberkatan Nikah.</li>
              </ul>
            </div>
            <div className="pf-notes">
              <h3>Catatan:</h3>
              <ul>
                <li>Harap Diisi dengan huruf cetak dan jelas.</li>
                <li>Ayah dan ibu harus hadir pada waktu penyerahan anak.</li>
                <li>Pada saat pengambilan Surat Penyerahan Anak harap membawa copy Formulir Penyerahan Anak.</li>
              </ul>
            </div>
          </div>

          <div className="pf-signature">
            <p className="pf-date">
              Bandung, {formatDate(d.tanggalPenyerahan) || '............................'}
            </p>
            <div className="pf-line" />
            <p className="pf-sig-label">Tanda Tangan dan Nama Jelas</p>
          </div>
        </div>
      </div>
    );
  }
);

export { PrintFormChildDedication };
