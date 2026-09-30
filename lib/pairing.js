// ============================================================
// lib/pairing.js — Qingxiao Botz Pairing System
// Menangani login QR Code dan Pairing Code secara modular.
// ============================================================

import readline from 'readline'
import chalk from 'chalk'

/**
 * Bersihkan nomor telepon dari karakter yang tidak diperlukan.
 * Mendukung seluruh format nomor internasional.
 * @param {string} raw - Nomor mentah dari input user atau config
 * @returns {string} - Nomor bersih hanya berisi angka
 */
export function sanitizePhoneNumber(raw) {
  return String(raw || '').replace(/[\s+\-().]/g, '').replace(/[^0-9]/g, '')
}

/**
 * Validasi apakah nomor telepon yang sudah dibersihkan valid.
 * Minimal 7 digit, maksimal 15 digit (standar E.164).
 * @param {string} cleaned - Nomor yang sudah dibersihkan
 * @returns {boolean}
 */
export function isValidPhoneNumber(cleaned) {
  return /^[0-9]{7,15}$/.test(cleaned)
}

/**
 * Tampilkan menu pilihan metode login di terminal.
 * @returns {Promise<'qr'|'pairing'>}
 */
export async function showLoginMenu() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const ask = (prompt) => new Promise(resolve => rl.question(prompt, resolve))

  console.log('')
  console.log(chalk.cyan('╔═════════════════════════════════════╗'))
  console.log(chalk.cyan('║') + chalk.bold.white('   Qingxiao Botz — Login Method      ') + chalk.cyan('║'))
  console.log(chalk.cyan('╠═════════════════════════════════════╣'))
  console.log(chalk.cyan('║') + '                                     ' + chalk.cyan('║'))
  console.log(chalk.cyan('║') + chalk.yellow('  [1]') + ' QR Code Pairing               ' + chalk.cyan('║'))
  console.log(chalk.cyan('║') + '                                     ' + chalk.cyan('║'))
  console.log(chalk.cyan('║') + chalk.yellow('  [2]') + ' Pairing Code                  ' + chalk.cyan('║'))
  console.log(chalk.cyan('║') + '                                     ' + chalk.cyan('║'))
  console.log(chalk.cyan('╚═════════════════════════════════════╝'))
  console.log('')

  let choice = ''
  while (!['1', '2'].includes(choice)) {
    choice = (await ask(chalk.white('Pilih metode [1/2]: '))).trim()
    if (!['1', '2'].includes(choice)) {
      console.log(chalk.red('⚠ Pilihan tidak valid. Masukkan 1 atau 2.'))
    }
  }

  rl.close()

  if (choice === '1') {
    console.log(chalk.green('\n✅ Metode: QR Code Pairing dipilih\n'))
    return 'qr'
  } else {
    console.log(chalk.green('\n✅ Metode: Pairing Code dipilih\n'))
    return 'pairing'
  }
}

/**
 * Minta input nomor WhatsApp dari user di terminal.
 * Mendukung seluruh kode negara internasional.
 * @returns {Promise<string>} - Nomor bersih yang valid
 */
export async function askPhoneNumber() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const ask = (prompt) => new Promise(resolve => rl.question(prompt, resolve))

  console.log(chalk.cyan('\n─────────────────────────────────────'))
  console.log(chalk.white(' Masukkan Nomor WhatsApp (dengan kode negara)'))
  console.log(chalk.gray(' Contoh: 628xxxxxxxx / 601xxxxxxxx / 447xxxxxxxx'))
  console.log(chalk.cyan('─────────────────────────────────────'))

  let phoneNumber = ''
  while (true) {
    const raw = await ask(chalk.white(' > '))
    const cleaned = sanitizePhoneNumber(raw)

    if (isValidPhoneNumber(cleaned)) {
      phoneNumber = cleaned
      break
    } else {
      console.log(chalk.red('⚠ Nomor tidak valid. Pastikan menggunakan kode negara dan minimal 7 digit.'))
      console.log(chalk.gray('  Contoh: 628xxxxxxxx (Indonesia), 601xxxxxxxx (Malaysia), 919xxxxxxx (India)'))
    }
  }

  rl.close()
  return phoneNumber
}

/**
 * Generate Pairing Code dari koneksi Baileys.
 * @param {object} conn - Instance Baileys socket
 * @param {string} phoneNumber - Nomor bersih (tanpa spasi/simbol)
 */
export async function generatePairingCode(conn, phoneNumber) {
  try {
    console.log(chalk.bgCyan(chalk.black(` [ INFO ] Membuat Pairing Code untuk: +${phoneNumber} `)))
    const code = await conn.requestPairingCode(phoneNumber, 'QINGXIAO')
    const formatted = code?.match(/.{1,4}/g)?.join('-') || code
    console.log('')
    console.log(chalk.bgGreen(chalk.black(' ✦ YOUR PAIRING CODE ✦ ')))
    console.log(chalk.bold.white(`\n    ${formatted}\n`))
    console.log(chalk.gray(' Masukkan kode ini di WhatsApp:'))
    console.log(chalk.gray(' Setelan → Perangkat tertaut → Tautkan perangkat'))
    console.log('')
  } catch (e) {
    console.error(chalk.red('✗ Gagal membuat Pairing Code:'), e?.message || e)
  }
}
