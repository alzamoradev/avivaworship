import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample songs
  const songs = [
    {
      title: 'Así Es Tu Amor',
      artist: 'AVIVA Worship',
      album: 'Su Persona Vol. 1',
      albumCover: '/images/su-persona-vol-1.jpg',
      originalKey: 'G',
      tempo: 72,
      isFeatured: true,
      spotifyUrl: 'https://open.spotify.com/track/example1',
      youtubeUrl: 'https://youtube.com/watch?v=example1',
      lyrics: `Verso 1:
Así es tu amor
Tan grande y fiel
Me alcanzó tu gracia
Y cambió mi ser

Coro:
Tu amor me envuelve
Tu paz me llena
En tu presencia
Todo es mejor

Verso 2:
No hay nada igual
A tu fidelidad
Cada mañana nueva
Tu amor está`,
      lyricsChords: `Verso 1:
[G]Así es tu a[Em]mor
[C]Tan grande y [D]fiel
[G]Me alcanzó tu [Em]gracia
[C]Y cambió mi [D]ser

Coro:
[G]Tu amor me en[Em]vuelve
[C]Tu paz me [D]llena
[G]En tu pre[Em]sencia
[C]Todo es me[D]jor

Verso 2:
[G]No hay nada i[Em]gual
[C]A tu fideli[D]dad
[G]Cada mañana [Em]nueva
[C]Tu amor es[D]tá`,
    },
    {
      title: 'Nos Amas',
      artist: 'AVIVA Worship',
      album: 'Su Obra Vol. 2',
      albumCover: '/images/su-obra-vol-2.jpg',
      originalKey: 'C',
      tempo: 68,
      isFeatured: true,
      spotifyUrl: 'https://open.spotify.com/track/example2',
      youtubeUrl: 'https://youtube.com/watch?v=example2',
      lyrics: `Verso 1:
Nos amas sin condición
Con todo tu corazón
Tu gracia nos alcanzó
Y todo lo transformó

Coro:
Grande es tu amor
Inmenso y fiel
Nos das lo mejor
De principio a fin

Puente:
Nada nos separará
De tu amor, de tu bondad
Siempre estarás
Junto a nosotros`,
      lyricsChords: `Verso 1:
[C]Nos amas sin condi[G]ción
[Am]Con todo tu cora[F]zón
[C]Tu gracia nos alcan[G]zó
[Am]Y todo lo transfor[F]mó

Coro:
[F]Grande es tu a[C]mor
[G]Inmenso y [Am]fiel
[F]Nos das lo me[C]jor
[G]De principio a [Am]fin

Puente:
[F]Nada nos separa[C]rá
[G]De tu amor, de tu bon[Am]dad
[F]Siempre esta[C]rás
[G]Junto a noso[Am]tros`,
    },
    {
      title: 'Tu Presencia',
      artist: 'AVIVA Worship',
      album: 'Su Persona Vol. 1',
      albumCover: '/images/su-persona-vol-1.jpg',
      originalKey: 'D',
      tempo: 76,
      isFeatured: true,
      lyrics: `Verso 1:
En tu presencia encuentro paz
Un refugio donde descansar
Tus brazos me sostienen
Tu amor me envuelve

Coro:
Quiero más de ti
Más de tu presencia aquí
Inunda este lugar
Con tu gloria sin igual

Verso 2:
Mi corazón te anhela
Mi alma te necesita
Eres todo lo que quiero
Eres todo para mí`,
      lyricsChords: `Verso 1:
[D]En tu presencia encuentro [A]paz
[Bm]Un refugio donde descan[G]sar
[D]Tus brazos me sostie[A]nen
[Bm]Tu amor me envuel[G]ve

Coro:
[G]Quiero más de [D]ti
[A]Más de tu presen[Bm]cia aquí
[G]Inunda este lu[D]gar
[A]Con tu gloria sin i[Bm]gual

Verso 2:
[D]Mi corazón te anhe[A]la
[Bm]Mi alma te necesi[G]ta
[D]Eres todo lo que quie[A]ro
[Bm]Eres todo para [G]mí`,
    },
    {
      title: 'Rendido Estoy',
      artist: 'AVIVA Worship',
      album: 'Su Obra Vol. 2',
      albumCover: '/images/su-obra-vol-2.jpg',
      originalKey: 'E',
      tempo: 65,
      isFeatured: false,
      lyrics: `Verso 1:
Rendido estoy ante ti
Postrado en adoración
No hay otro lugar
Donde quiera estar

Coro:
Te entrego todo
Lo que soy
Mi vida entera
Es para ti

Puente:
Santo, Santo, Santo
Digno de adorar
Rey de reyes
Señor de señores`,
      lyricsChords: `Verso 1:
[E]Rendido estoy ante [B]ti
[C#m]Postrado en adora[A]ción
[E]No hay otro lu[B]gar
[C#m]Donde quiera es[A]tar

Coro:
[A]Te entrego [E]todo
[B]Lo que [C#m]soy
[A]Mi vida ente[E]ra
[B]Es para [C#m]ti

Puente:
[A]Santo, Santo, [E]Santo
[B]Digno de ado[C#m]rar
[A]Rey de re[E]yes
[B]Señor de seño[C#m]res`,
    },
    {
      title: 'Glorioso',
      artist: 'AVIVA Worship',
      album: 'Su Persona Vol. 1',
      albumCover: '/images/su-persona-vol-1.jpg',
      originalKey: 'A',
      tempo: 130,
      isFeatured: true,
      lyrics: `Verso 1:
Tu nombre es glorioso
Por siempre será
En todo el universo
Tu reino reinará

Coro:
Glorioso, glorioso
Eres tú Señor
Glorioso, glorioso
Digno de honor

Verso 2:
Los cielos declaran
Tu inmensa majestad
Las naciones se postran
Ante tu santidad`,
      lyricsChords: `Verso 1:
[A]Tu nombre es glorio[E]so
[F#m]Por siempre se[D]rá
[A]En todo el univer[E]so
[F#m]Tu reino reina[D]rá

Coro:
[D]Glorioso, glorio[A]so
[E]Eres tú Se[F#m]ñor
[D]Glorioso, glorio[A]so
[E]Digno de ho[F#m]nor

Verso 2:
[A]Los cielos decla[E]ran
[F#m]Tu inmensa majes[D]tad
[A]Las naciones se pos[E]tran
[F#m]Ante tu santi[D]dad`,
    },
  ]

  for (const song of songs) {
    const slug = song.title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/í/g, 'i')
      .replace(/ó/g, 'o')
      .replace(/ú/g, 'u')
      .replace(/ñ/g, 'n')

    await prisma.song.upsert({
      where: { slug },
      update: song,
      create: {
        slug,
        ...song,
      },
    })
    console.log(`✅ Created/Updated song: ${song.title}`)
  }

  // Create a default admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@avivaworship.com' },
    update: {},
    create: {
      email: 'admin@avivaworship.com',
      name: 'Admin AVIVA',
      role: 'admin',
    },
  })
  console.log(`✅ Created admin user: ${adminUser.email}`)

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
