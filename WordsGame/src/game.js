import { levelConfig } from "./config";
import { indexConfig } from "./index";
import gsap from "gsap";
import { Application, Container, Graphics, Sprite, Text, TextStyle } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH } from ".";

export function getLevelConfig(level){
  const levelInfo = `level${level}`;
  return levelConfig[levelInfo] || null;
}

export default class Game extends Container {
  constructor(level = "level1") {
    super();
    this.clickedLetters = [];
    this.letterBackgroundImages = [];
    this.hoveredLetters = [];
    this.letterCounter = 0;
    this.isDrawing = false;
    this.currentHoveredLetter = null;
    this.level = level;
    this.foundWords = new Set();
    this.GridInfo = levelConfig.level1.levelGrids.levelLetters;
    this.levelCount = 1;
    this.bSetupUI = false;

    this.init();
  }

  async init() {
    this.loadLevelConfig("level" + this.levelCount);

    this.app = new Application({ width: GAME_WIDTH * 0, height: GAME_HEIGHT * 0});
    document.body.appendChild(this.app.view);
    this.app.stage.addChild(this);

    // Setup the initial UI (logo, button, etc.)   
    this.setupUI();

    this.interactive = true;
    this.on('mousemove', this.onMouseMove.bind(this));
    this.on('pointerdown', this.onMouseDown.bind(this));
    this.on('pointerup', this.onMouseUp.bind(this));

    this.formedWordText = new Text("", { fontSize: 36, fill: "#FF7F00" });
    this.formedWordText.anchor.set(0.5);
    this.formedWordText.x = GAME_WIDTH / 2;
    this.formedWordText.y = GAME_HEIGHT / 2;
    this.addChild(this.formedWordText);
  }

  //Config.js icirindeki bilgileri guncel level bilgimize gore guncelliyor. 
  loadLevelConfig(level) {
    const config = levelConfig[level];
    if (config) {
      this.letters = config.letters;
      this.targetWords = config.targetWords;
    } else {
      //console.error(Level config for ${level} not found);
    }
  }

  //Start ekranindaki UI ogelerinin olusturulmasi icin yapildi.
  setupUI() {
    let button = Sprite.from("assets/orange-pane.png");
    button.anchor.set(0.1);
    button.scale.set(0.5);
    this.addChild(button);
    button.x = GAME_WIDTH * 0.3;
    button.y = GAME_HEIGHT * 0.6;

    button.cursor = 'pointer';
    button.interactive = true;
    button.buttonMode = true;

    let sprite = Sprite.from("hand");
    sprite.anchor.set(0.5);
    sprite.scale.set(0.5);
    this.addChild(sprite);
    sprite.x = GAME_WIDTH * 0.7;
    sprite.y = GAME_HEIGHT * 0.7;

    let logo = Sprite.from("assets/core/logo_white.png");
    logo.anchor.set(0.1);
    logo.scale.set(0.5);
    this.addChild(logo);
    logo.x = GAME_WIDTH * 0.25;
    logo.y = GAME_HEIGHT * 0.2;

    gsap.to(sprite, {
      pixi: { scale: 0.7 },
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "sine.easeInOut"
    });

    let textStyle = new TextStyle({ fill: "#ffffff", fontSize: 40 });
    let metin = new Text("Play", textStyle);
    metin.anchor.set(0.5);
    metin.x = GAME_WIDTH * 0.48;
    metin.y = GAME_HEIGHT * 0.62;
    this.addChild(metin);

    button.on('pointerup', this.onClick.bind(this));
  }

  //Play buttonu sonrasinda oyunun baslatilmasi gerekli fonksiyonlarin calistirilmasi icin kullaniliyor.
  onClick() {
    this.hideCurrentScene();
    this.showGameScene();
  }

  //Sahne gecislerinde eski sahneyi gizlemek icin kullanildi.
  hideCurrentScene() {
    this.children.forEach(child => { child.visible = false; });
  }

  //Oyun ekranindaki UI ogelerinin olusturulmasi ve kullanabilecegimiz harflerin spawn edilmesi icin
  //kullaniliyor. createLetters harfleri config.js icerisinden cekiyor ve isliyor.
  showGameScene() {
    this.gameSceneSpawnImage(this.GridInfo);
    this.createLetters();
  }

  gameSceneSpawnImage(gridInfo) {
    let gameScene = new Container();
    let background = Sprite.from("assets/bg.png");
    background.width = GAME_WIDTH;
    background.height = GAME_HEIGHT;
    background.x = GAME_WIDTH / 2;
    background.y = GAME_HEIGHT / 2;
    background.anchor.set(0.5);
    gameScene.addChild(background);
    this.addChild(gameScene);
  
    let whiteCircle = Sprite.from("assets/bubble-white.png");
    whiteCircle.x = GAME_WIDTH / 2;
    whiteCircle.y = GAME_HEIGHT / 1.3;
    whiteCircle.anchor.set(0.5);
    whiteCircle.scale.set(0.7);
    gameScene.addChild(whiteCircle);
    whiteCircle.alpha = 0.65;
    this.createGrids(gameScene, gridInfo);
  }
  


  //Config.js icerisindeki grid dizisini cekerek sahnede gridleri olusturuyor.
  createGrids(gameScene, letters) {
  const GRID_SIZE = 4;
  const CELL_SIZE = 75;
  this.gridRects = []; // Kutuları saklamak için bir dizi

  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      let index = i * GRID_SIZE + j;
      if (letters[index] !== ' ') { // Sadece dolu hücreler için kutucuk oluştur
        let rect = Sprite.from("assets/rect.png");
        rect.width = CELL_SIZE;
        rect.height = CELL_SIZE;
        rect.x = 100 + j * (CELL_SIZE + 10);
        rect.y = 100 + i * (CELL_SIZE + 10);
        rect.anchor.set(0.5);
        gameScene.addChild(rect);

        this.gridRects[index] = { rect, letter: letters[index] }; // Kutuyu ve harfi sakla
      }
    }
  }
}

//Kullandigimiz 4 adet harfin olusturulmasi icin olusturuldu. Harfler configden cekiliyor.
createLetters() {
  const gridSize = 75;
  const offsetX = 165;
  const offsetY = 500;

  this.line = new Graphics();
  this.line.zIndex = 1;
  this.addChild(this.line);

  this.letterSprites = []; // Array to hold letter sprites

  this.letters.forEach((letter, index) => {
    let letterSprite = new Text(letter, { fontSize: 36, fill: "#FFFFFF" });
    if(index === 1){
      letterSprite.x = 165 + 75;
      letterSprite.y = 530;
    }else if(index === 3){
      letterSprite.x = 165 + 75;
      letterSprite.y = 695;
    }else{
      letterSprite.x = 165 + (index * 75);
      letterSprite.y = 615;
    }
    letterSprite.cursor = 'pointer';
    letterSprite.interactive = true;
    letterSprite.buttonMode = true;
    letterSprite.anchor.set(0.5);
    letterSprite.scale.set(1.3);

    let letterContainer = new Container();
    letterContainer.zIndex = 2;
    this.addChild(letterContainer);

    letterContainer.addChild(letterSprite);
    this.letterSprites.push(letterSprite); // Add sprite to array

    letterSprite.on('pointerdown', this.onLetterClick.bind(this, letterSprite, letterContainer));
    letterSprite.on('pointerover', this.onLetterOver.bind(this, letterSprite, letterContainer));
    letterSprite.on('pointerout', this.onLetterOut.bind(this, letterSprite));
  });

  this.basicText = new Text("", { fontSize: 48, fill: "#FF7F00" });
  this.basicText.x = 200;
  this.basicText.y = 400;
  this.addChild(this.basicText);

  this.shuffleButton = Sprite.from("assets/suffle.png");
  this.shuffleButton.x = 215;
  this.shuffleButton.y = 585;
  this.shuffleButton.interactive = true;
  this.shuffleButton.buttonMode = true;
  this.shuffleButton.scale.set(0.1);
  this.shuffleButton.on('pointerdown', this.onShuffleButtonClick.bind(this));
  this.addChild(this.shuffleButton);

  this.sortChildren();
}

//Shuffle buttonuna basildiginda harflerin yerini degistiriyor.

updateLetterPositions() {
  const gridSize = 75;
  const offsetX = 165;
  const offsetY = 500;

  this.letterSprites.forEach((letterSprite, index) => {
    if(index === 1){
      letterSprite.x = offsetX + gridSize;
      letterSprite.y = 530;
    }else if(index === 3){
      letterSprite.x = offsetX + gridSize;
      letterSprite.y = 695;
    }else{
      letterSprite.x = offsetX + (index * gridSize);
      letterSprite.y = 615;
    }
  });
}

shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

onShuffleButtonClick() {
  this.shuffleArray(this.letterSprites);
  this.updateLetterPositions();
}

  
//onLetter fonksiyonlari mouse ile uzerine geldigimiz harflerden bir kelime olusturmamiz icin mouse pozisyonumuzu takip ediyor.
//Temas ettigimiz harflerden bir kelime olusturmamiza yariyor.
  onLetterClick(letterSprite, letterContainer) {
    if (this.clickedLetters.length === 0) {
      this.clickedLetters.push(letterSprite);
      this.hoveredLetters.push(letterSprite.text);
      this.updateFormedWordText();
      this.letterBackgroundImage(letterSprite, letterContainer);
    }
  }

  onLetterOver(letterSprite, letterContainer) {
    this.currentHoveredLetter = letterSprite.text;

    if (this.isDrawing && this.clickedLetters.length > 0 && this.clickedLetters.indexOf(letterSprite) === -1) {
      this.letterCounter += 1;
      this.clickedLetters.push(letterSprite);
      this.hoveredLetters.push(letterSprite.text);
      this.updateLine();
      this.letterBackgroundImage(letterSprite, letterContainer);
      this.updateFormedWordText();
    }
  }

  onLetterOut(letterSprite) {
    if (this.currentHoveredLetter === letterSprite.text) {
      this.currentHoveredLetter = null;
      this.updateLine();
    }
  }

  //mouse pozisyonumuzda cizgi cizmemize ve mouse hareketini kontrol eden fonksiyon.
  onMouseMove(event) {
    if (this.letterCounter >= 3) {
      return;
    }
    if (this.isDrawing && this.clickedLetters.length > 0) {
      const mousePosition = event.data.global;
      this.updateLine(mousePosition);
    }
  }

  onMouseDown(event) {
    this.isDrawing = true;
  }

  onMouseUp(event) {
    if (this.checkWordMatch()) {
      console.log('Word found in grid');
    } else {
      console.log('Word not found in grid');
    }
  
    this.isDrawing = false;
    this.line.clear();
    this.clearLetterBackgroundImages();
    this.clickedLetters = [];
    this.hoveredLetters = [];
    this.letterCounter = 0;
    this.updateFormedWordText();
  }


  //Bu fonksiyon sectigimiz iki harf arasindaki cizgiyi ciziyor. 

  updateLine(mousePosition = null) {
    this.line.clear();
    this.line.lineStyle(10, 0xFF5733, 3);

    if (this.clickedLetters.length > 0) {
      this.line.moveTo(this.clickedLetters[0].x, this.clickedLetters[0].y);

      for (let i = 1; i < this.clickedLetters.length; i++) {
        const currentLetter = this.clickedLetters[i];
        this.line.lineTo(currentLetter.x, currentLetter.y);
      }

      if (this.currentHoveredLetter) {
        const lastLetter = this.clickedLetters[this.clickedLetters.length - 1];
        this.line.lineTo(lastLetter.x, lastLetter.y);
      } else if (mousePosition) {
        const lastLetter = this.clickedLetters[this.clickedLetters.length - 1];
        this.line.lineTo(mousePosition.x, mousePosition.y);
      }
    }
  }

  //Bu fonksiyonda bulundugumuz levelin configden gelen verdigimiz kelimeler cizerek olusturdugumuz 
  //kelime ile uyusuyor mu onun kontrolunu sagliyor.
  //Saglanmasi durumunda fillLettersInRects fonksiyonunu tetikliyor.

  checkWordMatch() {
    const formedWord = this.basicText.text.toLowerCase();
    const lettersGrid = this.GridInfo;
  
    // Check rows
    for (let i = 0; i < 4; i++) {
      let rowWord = '';
      let rowIndices = [];
      for (let j = 0; j < 4; j++) {
        let index = i * 4 + j;
        if (lettersGrid[index] !== ' ') {
          rowWord += lettersGrid[index].toLowerCase();
          rowIndices.push(index);
        }
      }
      if (rowWord === formedWord) {
        this.fillLettersInRects(rowIndices);
        this.targetWords = this.targetWords.filter(word => word !== formedWord);
        if (this.targetWords.length === 0) {
          this.levelCount += 1;
          const levelData = getLevelConfig(this.levelCount);
          this.GridInfo = levelData.levelGrids.levelLetters;
          this.letters = levelData.letters;
          this.targetWords = levelData.targetWords;
          this.hideCurrentScene();
          this.showGameScene();
        }
        return true;
      }
    }
    if(this.targetWords.includes(formedWord)){
      const deleteIndex = this.targetWords.indexOf(formedWord);
      this.targetWords.splice(deleteIndex,1);
    }
    // Check columns
    for (let j = 0; j < 4; j++) {
      let colWord = '';
      let colIndices = [];
      for (let i = 0; i < 4; i++) {
        let index = i * 4 + j;
        if (lettersGrid[index] !== ' ') {
          colWord += lettersGrid[index].toLowerCase();
          colIndices.push(index);
        }
      }
      if (colWord === formedWord) {
        this.fillLettersInRects(colIndices);
        this.targetWords = this.targetWords.filter(word => word !== formedWord);
        if (this.targetWords.length === 0) {
          this.levelCount += 1;
          const levelData = getLevelConfig(this.levelCount);
          this.GridInfo = levelData.levelGrids.levelLetters;
          this.letters = levelData.letters;
          this.targetWords = levelData.targetWords;
          this.hideCurrentScene();
          this.showGameScene();
        }
        return true;
      }
    }
  
    return false;
  }

  //checkWordMatch fonksiyonundaki eslesmeler dogruysa ekrandaki gridlerin icini doldurmaya yarayan fonksiyon

  fillLettersInRects(indices) {
    indices.forEach(index => {
      const { rect, letter } = this.gridRects[index];
      let letterText = new Text(letter, {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0x000000,
        align: 'center'
      });
      letterText.anchor.set(0.5);
      letterText.x = rect.x;
      letterText.y = rect.y;
      rect.parent.addChild(letterText);
    });
  }


  //temas ettigimiz harflerin arka tarafinda olusturdugumuz turuncu daireleri ciziyor.

  letterBackgroundImage(letterSprite, letterContainer) {
    let image = Sprite.from("assets/circle0.png");
    image.anchor.set(0.5);
    image.scale.set(0.2);
    image.x = letterSprite.x;
    image.y = letterSprite.y;
    image.zIndex = 1;
    letterContainer.addChildAt(image, 0);
    this.letterBackgroundImages.push(image);
  }
  
  //Cizdigimizde harflerin arkasinda cikan turuncu dairelerin temizlenmesi icin yapildi.
  clearLetterBackgroundImages() {
    this.letterBackgroundImages.forEach(image => {
      image.destroy();
    });
    this.letterBackgroundImages = [];
  }


  //Bu fonksiyonda cizerek olusturdugumuz harfleri birlestirerek kelime olusturuluyor.
  updateFormedWordText() {
    const formedWord = this.hoveredLetters.join('');
    this.formedWordText.text = `${formedWord}`;
    this.basicText.text = `${formedWord}`;
  }

}