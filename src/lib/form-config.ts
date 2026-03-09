import type { FormConfig } from './form-types';

export const FORM_CONFIGS: FormConfig[] = [
  {
    type: 'kom',
    title: 'Pendaftaran KOM',
    description: 'Daftar kelas Kehidupan Orientasi Melayani',
    icon: 'GraduationCap',
    steps: [
      { field: 'namaLengkap', question: 'Siapa nama lengkap Anda?', type: 'text' },
      { field: 'tempatLahir', question: 'Dimana tempat lahir Anda?', type: 'text' },
      { field: 'tanggalLahir', question: 'Kapan tanggal lahir Anda?', type: 'date' },
      { field: 'jenisKelamin', question: 'Jenis kelamin?', type: 'select', options: ['Pria', 'Wanita'] },
      { field: 'alamat', question: 'Alamat tempat tinggal saat ini?', type: 'textarea' },
      { field: 'noTelepon', question: 'Nomor WhatsApp Anda?', type: 'tel' },
      { field: 'email', question: 'Alamat email? (opsional)', type: 'email', optional: true },
      { field: 'levelKOM', question: 'Level KOM yang ingin diikuti?', type: 'select', options: ['100', '200', '300', '400'] },
      { field: 'sudahBaptis', question: 'Apakah sudah dibaptis?', type: 'select', options: ['Sudah', 'Belum'] },
      { field: 'gerejaAsal', question: 'Gereja asal? (kosongkan jika dari BEC)', type: 'text', optional: true },
    ],
  },
  {
    type: 'baptism',
    title: 'Pendaftaran Baptisan',
    description: 'Daftar baptisan air',
    icon: 'Droplets',
    steps: [
      { field: 'namaLengkap', question: 'Siapa nama lengkap Anda?', type: 'text' },
      { field: 'tempatLahir', question: 'Dimana tempat lahir Anda?', type: 'text' },
      { field: 'tanggalLahir', question: 'Kapan tanggal lahir Anda?', type: 'date' },
      { field: 'jenisKelamin', question: 'Jenis kelamin?', type: 'select', options: ['Pria', 'Wanita'] },
      { field: 'alamat', question: 'Alamat tempat tinggal saat ini?', type: 'textarea' },
      { field: 'noTelepon', question: 'Nomor WhatsApp Anda?', type: 'tel' },
      { field: 'email', question: 'Alamat email?', type: 'email' },
      { field: 'sudahKOM100', question: 'Apakah sudah menyelesaikan KOM 100?', type: 'select', options: ['Sudah', 'Belum'] },
      { field: 'alasanBaptis', question: 'Ceritakan alasan dan kesaksian Anda untuk dibaptis.', type: 'textarea' },
    ],
  },
  {
    type: 'child-dedication',
    title: 'Penyerahan Anak',
    description: 'Daftar penyerahan anak',
    icon: 'Baby',
    steps: [
      { field: 'namaAnak', question: 'Siapa nama lengkap anak?', type: 'text' },
      { field: 'tempatLahirAnak', question: 'Dimana tempat lahir anak?', type: 'text' },
      { field: 'tanggalLahirAnak', question: 'Kapan tanggal lahir anak?', type: 'date' },
      { field: 'jenisKelaminAnak', question: 'Jenis kelamin anak?', type: 'select', options: ['Laki-laki', 'Perempuan'] },
      { field: 'namaAyah', question: 'Nama lengkap ayah?', type: 'text' },
      { field: 'namaIbu', question: 'Nama lengkap ibu?', type: 'text' },
      { field: 'noTelepon', question: 'Nomor WhatsApp orang tua?', type: 'tel' },
      { field: 'alamat', question: 'Alamat tempat tinggal?', type: 'textarea' },
      { field: 'sudahMenikahGereja', question: 'Apakah orang tua sudah menikah secara gereja?', type: 'select', options: ['Sudah', 'Belum'] },
    ],
  },
  {
    type: 'prayer',
    title: 'Pokok Doa',
    description: 'Sampaikan pokok doa Anda',
    icon: 'HandHeart',
    steps: [
      { field: 'namaLengkap', question: 'Siapa nama Anda?', type: 'text' },
      { field: 'noTelepon', question: 'Nomor WhatsApp Anda?', type: 'tel' },
      { field: 'kategoriDoa', question: 'Kategori pokok doa?', type: 'select', options: ['Kesehatan', 'Keluarga', 'Pekerjaan', 'Rohani', 'Lainnya'] },
      { field: 'isiDoa', question: 'Tuliskan pokok doa Anda.', type: 'textarea' },
      { field: 'bolehDibagikan', question: 'Bolehkah pokok doa ini dibagikan ke tim pendoa?', type: 'select', options: ['Boleh', 'Tidak'] },
    ],
  },
];

export function getFormConfig(type: string): FormConfig | undefined {
  return FORM_CONFIGS.find(c => c.type === type);
}

export const FORM_TYPE_LABELS: Record<string, string> = {
  kom: 'KOM',
  baptism: 'Baptisan',
  'child-dedication': 'Penyerahan Anak',
  prayer: 'Pokok Doa',
};

export const FORM_STATUS_LABELS: Record<string, string> = {
  pending: 'Menunggu',
  reviewed: 'Ditinjau',
  completed: 'Selesai',
};
