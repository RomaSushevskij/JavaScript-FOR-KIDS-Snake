 //Создаем переменные и получаем контекст рисования
 var canvas = document.getElementById("canvas");
 var ctx = canvas.getContext("2d");
 var width = canvas.width;
 var height = canvas.height;
 var score = 0;
         
 //Создаем сетку
 var blockSize = 20;
 var widthInBlocks = width / blockSize;
 var heightInBlocks = height / blockSize;

 //Функция рисования рамки
 var drawBorder = function() {
     ctx.fillStyle = "gray";
     ctx.fillRect(0, 0, width, blockSize);
     ctx.fillRect(0, height - blockSize, width, blockSize);
     ctx.fillRect(0, 0, blockSize, height);
     ctx.fillRect(width - blockSize, 0, blockSize, height);
 };
 
 
 //Функция рисования счета
 var drawScore = function() {
     ctx.fillStyle = "black";
     ctx.font = "40px Courier";
     ctx.textBaseline = "top";
     ctx.textAlign = "left";
     ctx.fillText("Счет: " + score, blockSize, blockSize);
 };

 //Функция уведомления о завершении игры
 var gameOver = function() {
     clearInterval(intervalId);
     ctx.fillStyle = "black";
     ctx.font = "80px Courier";
     ctx.textBaseline = "middle";
     ctx.textAlign = "center";
     ctx.fillText("Конец игры", width / 2, height / 2);
 };

 //Функция рисования окружности
 var circle = function (x, y, r, fillCircle) {
     ctx.beginPath();
     ctx.arc(x, y, r, 0, Math.PI * 2, false);
     if(fillCircle) {
         ctx.fill();
     } else {
         ctx.stroke();
     }
 };

 //Конструктор Block
 var Block = function(col, row) {
     this.col = col;
     this.row = row;
 };

 //Метод конструктора Block для рисования сегмента в позиции ячейки
 Block.prototype.drawSquare = function(color) {
     ctx.fillStyle = color;
     var x = this.col * blockSize;
     var y = this.row * blockSize;
     ctx.fillRect(x, y, blockSize, blockSize);
 };

 //Метод конструктора Block для рисования окружности в позиции ячейки
 Block.prototype.drawCircle = function(color) {
     ctx.fillStyle = color;
     var centerX = this.col * blockSize + blockSize/2;
     var centerY = this.row * blockSize + blockSize/2;
     circle(centerX, centerY, blockSize/2, true)
 };

 //Метод конструктора Block для проверки нахождения объектов в одних и тех же ячейках
 Block.prototype.equal = function(otherBlock) {
     return this.col === otherBlock.col && this.row === otherBlock.row;
 };

 //Конструктор Snake
 var Snake = function() {
     this.segments = [
         new Block(7, 5),
         new Block(6, 5),
         new Block(5, 5)
     ];
     this.direction = "right";
     this.nextDirection = "right";
 };

 //Метод конструктора Snake для рисования сегментов змейки
 Snake.prototype.draw = function() {
     this.segments[0].drawSquare("#DF3B01");
     for (var i = 1; i < this.segments.length; i += 2) {
         this.segments[i].drawSquare("#788F00");
     }
     for (var j = 2; j < this.segments.length; j += 2) {
         this.segments[j].drawSquare("#E28B00");
     };
 };

 //Метод конструктора Snake для передвижения змейки
 Snake.prototype.move = function() {
     var head = this.segments[0];
     var newHead;

     this.direction = this.nextDirection;
     
     if (this.direction === "right") {
         newHead = new Block(head.col + 1, head.row);
     } else if (this.direction === "left") {
         newHead = new Block(head.col - 1, head.row);
     } else if (this.direction === "up") {
         newHead = new Block(head.col, head.row - 1);
     } else if (this.direction === "down") {
         newHead = new Block(head.col, head.row + 1)
     }

     if (this.checkCollision(newHead)) {
         gameOver();
         return;
     }

     this.segments.unshift(newHead);
     if (newHead.equal(apple.position)) {
         score += 1;
         apple.move(this.segments);
     } else {
         this.segments.pop();
     }
 };

 //Метод конструктора Snake для определения столкновения змейки со стенами или со своим телом
 Snake.prototype.checkCollision = function(head) {
     var leftCollision = (head.col === 0);
     var rightCollision = (head.col === widthInBlocks - 1);
     var topCollision = (head.row === 0);
     var bottomCollision = (head.row === heightInBlocks - 1);
    
     var wallCollision = leftCollision || rightCollision || topCollision || bottomCollision;
     
     var selfCollision = false;
     for (var i = 0; i < this.segments.length; i += 1) {
        if (head.equal(this.segments[i])) {
            selfCollision = true;
        }
     }

     return wallCollision || selfCollision;
 };
 
 //Метод констуктора Snake для исключения недопустимых смен направления движения
 Snake.prototype.setDirection = function(newDirection) {
     if (this.direction === "left" && newDirection === "right") {
         return;
     } else if (this.direction === "right" && newDirection === "left") {
         return;
     } else if (this.direction === "up" && newDirection === "down") {
         return;
     } else if (this.direction === "down" && newDirection === "up") {
         return;
     }
     this.nextDirection = newDirection;
 };

 //Конструктор Apple 
 var Apple = function() {
     this.position = new Block(10, 10);
 };

 //Метод конструктора Apple для рисования яблока
 Apple.prototype.draw = function() {
     this.position.drawCircle("#FF3846");
 };

 //Метод конструктора Apple для перемещения яблока в новую случайную позицию
 Apple.prototype.move = function(occupiedBlocks) {
     var randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
     var randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
     this.position = new Block(randomCol, randomRow);
     //Проверка на совпедение позиции ячейки, в которой появилось яблоко и ячеек, занятых телом змейки
     for (var i = 0; i < occupiedBlocks.length; i += 1) {
         if (this.position.equal(occupiedBlocks[i])) {
             this.move(occupiedBlocks);//Вызываем метод move снова
             return; 
         }
     }
 };

 //Создаем объекты змейки и яблока
 var snake = new Snake();
 var apple = new Apple();

 //Запускаем функцию анимации через SetInterval
 var intervalId = setInterval(function() {
     ctx.clearRect(0, 0, width, height);
     drawScore();
     snake.move();
     snake.draw();
     apple.draw()
     drawBorder();
 }, 100);

 //Преобразуем коды клавиш в направления
 var directions = {
     37: "left",
     38: "up",
     39: "right",
     40: "down"
 };

 //Обработчик событий keydown
 $("body").keydown(function(event) {
     var newDirection = directions[event.keyCode];
     if (newDirection !== undefined) {
         snake.setDirection(newDirection);
     }
 });