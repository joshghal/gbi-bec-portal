'use client';

import { forwardRef } from 'react';

interface FormData {
  namaLengkap?: string;
  jenisKelamin?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  alamat?: string;
  rtRw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  kodePos?: string;
  noTelepon?: string;
  namaAyah?: string;
  namaIbu?: string;
  tanggalBaptis?: string;
  [key: string]: string | undefined;
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
  return val === 'Pria' ? 'L' : 'P';
}

const PrintFormBaptism = forwardRef<HTMLDivElement, Props>(
  function PrintFormBaptism({ data, nomor }, ref) {
    const d = data;

    return (
      <div ref={ref} className="print-form-baptis">
        <style>{`
          .print-form-baptis {
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
          .pf-header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
            margin-bottom: 4px;
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
          .pf-header .pf-branch {
            font-size: 10pt;
            font-weight: bold;
            margin: 2px 0 0;
          }
          .pf-header .pf-addr {
            font-size: 7.5pt;
            line-height: 1.3;
            margin: 2px 0 0;
          }
          .pf-subtitle {
            font-size: 9pt;
            font-style: italic;
            margin: 4px 0 8px;
          }
          .pf-title {
            text-align: center;
            margin: 12px 0 20px;
          }
          .pf-title h2 {
            font-size: 14pt;
            font-weight: bold;
            border: 2px solid #000;
            display: inline-block;
            padding: 4px 16px;
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
          .pf-declaration {
            margin-top: 20px;
            border: 2px solid #000;
            padding: 8px 12px;
            font-size: 10pt;
            font-weight: bold;
            font-style: italic;
            text-align: center;
            line-height: 1.4;
          }
          .pf-footer {
            margin-top: 16px;
            display: flex;
            gap: 24px;
          }
          .pf-notes {
            flex: 1;
          }
          .pf-notes h3 {
            font-size: 10pt;
            font-weight: bold;
            text-decoration: underline;
            margin: 0 0 4px;
          }
          .pf-notes ul {
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
            margin-bottom: 50px;
          }
          .pf-signature .pf-line {
            border-top: 1px solid #000;
            width: 160px;
            margin: 0 auto 2px;
          }
          .pf-signature .pf-sig-label {
            font-size: 9pt;
            text-transform: uppercase;
          }
          @media print {
            .print-form-baptis {
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
            Sekretariat : Jl. Aruna No. 19 Bandung - 40174<br />
            Telp. (022) 6003808 / 6007166 / 6011218 / 6012013 &nbsp; Fax. (022) 6012394 (SEKUM) / 6009231 (COOL)<br />
            Official website : www.gbisukawarna.org &nbsp; e-mail : gbisukawarna@gbisukawarna.org
          </p>
        </div>

        <p className="pf-subtitle">Mohon diisi sesuai dengan akte lahir</p>

        {/* Title */}
        <div className="pf-title">
          <h2>FORMULIR BAPTISAN</h2>
        </div>

        {/* Form fields */}
        <div>
          <div className="pf-row">
            <span className="pf-label">Nomor (Diisi Sekretariat)</span>
            <span className="pf-colon">:</span>
            <span className="pf-value">{nomor || ''}</span>
          </div>

          <div className="pf-row">
            <span className="pf-label">Nama Lengkap</span>
            <span className="pf-colon">:</span>
            <span className="pf-value">{d.namaLengkap || ''}</span>
          </div>

          <div className="pf-row">
            <span className="pf-label">Alamat Lengkap</span>
            <span className="pf-colon">:</span>
            <span className="pf-value">
              {d.alamat || ''}
              <span style={{ float: 'right' }}>({gender(d.jenisKelamin) || 'L/P'})</span>
            </span>
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
            <span className="pf-sub-label">Telp.</span>
            <span className="pf-sub-colon">:</span>
            <span className="pf-sub-value">{d.noTelepon || ''}</span>
          </div>

          <div className="pf-row" style={{ marginTop: 8 }}>
            <span className="pf-label">Tempat/Tanggal Lahir</span>
            <span className="pf-colon">:</span>
            <span className="pf-value">
              {[d.tempatLahir, formatDate(d.tanggalLahir)].filter(Boolean).join(', ')}
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
            <span className="pf-label">Tanggal Baptisan</span>
            <span className="pf-colon">:</span>
            <span className="pf-value">{d.tanggalBaptis || ''}</span>
          </div>

          <div className="pf-row">
            <span className="pf-label">Baptisan Ini Dilakukan Oleh</span>
            <span className="pf-colon">:</span>
            <span className="pf-value" />
          </div>
        </div>

        {/* Declaration */}
        <div className="pf-declaration">
          DENGAN INI SAYA MENYATAKAN BERSEDIA DIBAPTIS ATAS KEMAUAN SENDIRI DAN
          BERJANJI MENGIKUTI KOM (KEHIDUPAN ORIENTASI MELAYANI) SETELAH DIBAPTIS
        </div>

        {/* Footer */}
        <div className="pf-footer">
          <div className="pf-notes">
            <h3>CATATAN :</h3>
            <ul>
              <li>Harap diisi dengan huruf cetak dan jelas.</li>
              <li>Disertai 2 buah pas photo uk. 3 X 4 Cm.</li>
              <li>Surat Baptisan dapat diambil setelah menyelesaikan Kelas KOM 100.</li>
              <li>Pada saat pengambilan Surat Baptisan harap membawa copy Formulir Baptisan.</li>
            </ul>
          </div>

          <div className="pf-signature">
            <p className="pf-date">
              BANDUNG, {d.tanggalBaptis || '............................'}
            </p>
            <div style={{ height: 60 }} />
            <p style={{ fontSize: '11pt' }}>{d.namaLengkap || ''}</p>
          </div>
        </div>
      </div>
    );
  }
);

export { PrintFormBaptism };
