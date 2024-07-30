export const levelConfig = {    
  //BURADAN DILEDIGIMIZ KADAR LEVEL EKLEYEBILIYORUZ. BURAYA YAPTIGIM FORMATTA YENI LEVELLAR EKLENDIGINDE OYUN KODUNDADEGISIKLIK YAPMAMIZA
  //GEREK KALMIYOR. GRIDLERIN CIZIMI, BIZE VERILEN HARFLERIN HEPSI BURADAN KONTROL EDILIYOR. 

  //BUYUK KUCUK HARFE DIKKAT EDEREK DENEYINIZ.
    level1: {
        letters: ['G', 'O', 'L', 'D'],
        targetWords: ["dog", "gold", "god", "log"],
        levelGrids: {
          levelLetters: [
              'G', 'O', 'L', 'D',
              'O', ' ', 'O', ' ',
              'D', 'O', 'G', ' ',
              ' ', ' ', ' ', ' '
            ]
      }
      },
    level2: {
        letters: ['K', 'O', 'U', 'Ş'],
        targetWords: ["kuş", "koş", "şok", "koşu"],
        levelGrids: {
          levelLetters: [
              ' ', 'K', 'O', 'Ş',
              ' ', 'O', ' ', 'O',
              ' ', 'Ş', ' ', 'K',
              'K', 'U', 'Ş', ' '
            ]
      }
      },
      level3: {
        letters: ['X', 'X', 'X', 'X'],
        targetWords: ["xxx", "xxx", "xxx", "xxx"],
        levelGrids: {
          levelLetters: [
              'X', ' ', 'O', 'Ş',
              'Y', 'X', ' ', 'O',
              ' ', ' ', 'X', 'K',
              'K', ' ', ' ', 'X'
            ]
      }
      },
}