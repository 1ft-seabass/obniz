var isNode = (typeof window === 'undefined') ? true : false;

class MatrixLED_MAX7219 {

  constructor() {

  }

  wired(obniz, vcc, gnd, din, cs, clk, nc) {
    this.obniz = obniz;
    this.cs = obniz.getIO(cs);
    // logich high must 3.5v <=
    obniz.getIO(vcc).output(true);
    obniz.getIO(gnd).output(false);

    // reset a onece
    this.cs.output(true);
    obniz.freeze(10);
    this.cs.output(false);
    this.cs.output(true);
    
    // max 10Mhz but motor driver can't
    obniz.getIO(clk).drive("3v");
    obniz.getIO(din).drive("3v");
    this.spi = obniz.spi0; // TODO
    this.spi.start("master", clk, din, nc, 10 * 1000*1000);
  }

  init(width, height) {
    this.width = width;
    this.height = height;
    this.preparevram(width, height);
    this.initModule();
  }

  initModule() {
    this.write([0x09, 0x00]); // Code B decode for digits 3–0 No decode for digits 7–4
    this.write([0x0a, 0x05]); // brightness 9/32 0 to f
    this.write([0x0b, 0x07]); // Display digits 0 1 2 3 4 567
    this.write([0x0c, 0x01]); // Shutdown to normal operation
    this.passingCommands();
  }

  test() {
    this.write([0x0f, 0x00]); // test command
    this.passingCommands();
  }

  passingCommands() {
    for (var i=0; i<this.width; i+=8) {  // this needed for number of unit
      this.write([0x00, 0x00]);
      this.write([0x00, 0x00]);
      this.write([0x00, 0x00]);
    }
  }

  brightness(val) {
    this.write([0x0a, val]); // 0 to 15;
    this.passingCommands();
  }

  preparevram(width, height) {
    this.vram = [];
    for (var i=0; i<height; i++) {
      var dots = new Array(width/8);
      for (var ii=0;ii<dots.length; ii++) {
        dots[ii] = 0x00;
      }
      this.vram.push(dots);
    }
  }

  write(data) {
    this.cs.output(false);
    this.spi.write(data);
    this.cs.output(true);
  }

  writeVram() {
    for (var line_num=0; line_num<this.height; line_num++) {
      let addr = line_num + 1;
      let line = this.vram[line_num];
      let data = [];
      for (let col=0; col<line.length; col++) {
        data.push(addr)
        data.push(line[col]);
      }
      this.write(data);
    }
  }

  clear() {
    for (var line_num=0; line_num<this.height; line_num++) {
      let line = this.vram[line_num];
      for (let col=0; col<line.length; col++) {
        this.vram[line_num][col] = 0x00;
      }
      this.writeVram();
    }
  }

  drawCanvasContext(ctx) {
    if (isNode) {
      // TODO:
      throw new Error("node js mode is under working.");
    } else {
      const imageData = ctx.getImageData(0, 0, this.width, this.height);
      const data = imageData.data;
      
      for(let i = 0; i < data.length; i += 4) {
        var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
        var index = parseInt(i/4);
        var line = parseInt(index/this.width);
        var col = parseInt((index-line*this.width)/8);
        var bits = parseInt((index-line*this.width))%8;
        if (bits == 0)
          this.vram[line][col] = 0x00;
        if (brightness > 0x7F)
          this.vram[line][col] |= 0x80 >> bits;
      }
    }
    this.writeVram();
  }
}

if (PartsRegistrate) {
  PartsRegistrate("MatrixLED_MAX7219", MatrixLED_MAX7219);
}