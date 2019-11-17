function init() {
    const view = {
        setMsg: function (msg) {
            const msgArea = document.getElementById('game-msg');
            msgArea.textContent = msg;
        },
        setHit: function (location) {
            const cell = document.getElementById(location);
            cell.classList.add('hit');
        },
        setMiss: function (location) {
            const cell = document.getElementById(location);
            cell.classList.add('miss');
        },
        setSunk: function (shipLocation) {
            for (let i = 0; i < model.shipLength; i++) {
                const cell = document.getElementById(shipLocation[i]);
                cell.classList.add('sunk');
            }
        },
        setInfo: function (shipsSunk, numShips, bullets) {
            const sunkInfo = document.getElementById('game-sunk');
            sunkInfo.textContent = 'Потоплено: ' + shipsSunk + '/' + numShips;

            const bulletsInfo = document.getElementById('game-bullets');
            bulletsInfo.textContent = 'Снарядов: ' + bullets;
        },

        modalClose: function () {
            const modal = document.getElementById('modal');
            modal.classList.remove('show');
            if (controller.end) {
                const cells = document.querySelectorAll('.game__cell');
                for (let i = 0; i < cells.length; i++) {
                    cells[i].classList.remove('sunk');
                    cells[i].classList.remove('miss');
                    cells[i].classList.remove('hit');
                }
                controller.reset();
            }
        },
        modalShow: function (title, msg) {
            const modal = document.getElementById('modal');
            const bg = document.getElementById('modal-bg');
            const btn = document.getElementById('modal-btn');
            const header = document.getElementById('modal-header');
            const text = document.getElementById('modal-text');
            header.textContent = title;
            text.textContent = msg;
            modal.classList.add('show');
            bg.onclick = this.modalClose;
            btn.onclick = this.modalClose;
        }
    };

    const model = {
        fieldSize: 7,
        numShips: 3,
        shipLength: 3,
        shipsSunk: 0,

        ships: [
            {locations: [0, 0, 0], hits: ['', '', '']},
            {locations: [0, 0, 0], hits: ['', '', '']},
            {locations: [0, 0, 0], hits: ['', '', '']}
        ],

        fire: function (cellId, bullets) {
            for (let i = 0; i < this.numShips; i++) {
                const ship = this.ships[i];
                const index = ship.locations.indexOf(cellId);
                if (index >= 0) {
                    ship.hits[index] = 'hit';
                    view.setHit(cellId);
                    view.setMsg('Попал!');
                    if (this.isSunk(ship)) {
                        this.shipsSunk++;
                        view.setSunk(ship.locations);
                        view.setMsg('Вражеский корабль потоплен!');
                    }
                    view.setInfo(this.shipsSunk, this.numShips, bullets);
                    return true;
                }
            }
            view.setMiss(cellId);
            view.setMsg('Мимо!');
            view.setInfo(this.shipsSunk, this.numShips, bullets);
            return false;
        },

        isSunk: function (ship) {
            for (let i = 0; i < this.shipLength; i++) {
                if (!ship.hits[i]) {
                    return false;
                }
            }
            return true;
        },

        generateShipLocation: function () {
            let locations;

            for (let i = 0; i < this.numShips; i++) {
                do {
                    locations = this.generateShip();
                } while (this.collision(locations));
                this.ships[i].locations = locations;
            }
        },
        generateShip: function () {
            // direction: 0 - вертикальная, 1 - горизонтальная
            const direction = Math.floor(Math.random() * 2);
            let n, x, y, pos;

            if (direction) {
                // Горизонтальная позиция
                n = Math.floor(Math.random() * this.fieldSize); // 0-6
                y = this.fieldSize*n + 1; // 1, 8, 15, 22, 29, 36, 43
                x = Math.floor(Math.random() * (this.fieldSize - this.shipLength + 1)); // 0-4
                pos = y + x;
            }
            else {
                // Вертикальная позиция
                n = Math.floor(Math.random() * (this.fieldSize - this.shipLength + 1)); // 0-4
                y = this.fieldSize*n + 1; // 1, 8, 15, 22, 29
                x = Math.floor(Math.random() * this.fieldSize); // 0-6
                pos = y + x;
            }

            let newShipLocations = [];
            for (let i = 0; i < this.shipLength; i++) {
                if (direction) {
                    // Горизонтальная позиция
                    newShipLocations.push((pos + i).toString()); // pos, pos+1, pos+2
                }
                else {
                    // Вертикальная позиция
                    newShipLocations.push((pos + this.fieldSize*i).toString()); // pos, pos+7, pos+14
                }
            }
            return newShipLocations;
        },
        collision: function (locations) {
            for (let i = 0; i < this.numShips; i++) {
                const ship = model.ships[i];

                for (let j = 0; j < locations.length; j++) {
                    if (ship.locations.indexOf(locations[j]) >= 0){
                        return true;
                    }
                }
            }
            return false;
        }
    };

    const controller = {
        bullets: 20,
        counter: 0,
        end: false,

        processGuess: function (target) {
            if (!this.end &&
                target.classList.contains('game__cell')
                && !target.classList.contains('hit')
                && !target.classList.contains('miss')
                && !target.classList.contains('sunk')){

                if (this.counter < this.bullets) {
                    this.counter++;
                    model.fire(target.id, this.bullets - this.counter);
                }
                if (this.counter <= this.bullets && model.shipsSunk === model.numShips) {
                    view.setMsg('Победа!');
                    this.end = true;
                    view.modalShow('Победа!','Поздравляем, капитан! Вы потопили все вражеские корабли.');
                }
                else if (this.counter >= this.bullets) {
                    view.setMsg('Вы проиграли!');
                    this.end = true;
                    view.modalShow('Вы проиграли!','Вы не успели потопить все корабли противника.');
                }
            }
        },
        reset: function () {
            this.counter = 0;
            this.end = false;
            model.shipsSunk = 0;
            model.ships = [
                {locations: [0, 0, 0], hits: ['', '', '']},
                {locations: [0, 0, 0], hits: ['', '', '']},
                {locations: [0, 0, 0], hits: ['', '', '']}
            ];
            model.generateShipLocation();
            view.setInfo(model.shipsSunk,model.numShips,controller.bullets);
        }
    };

    controller.reset();
    view.modalShow('Новая игра', 'Приготовтесь капитан, мы попали в засаду! У нас есть 20 снарядов. ' +
        'Необходимо вычислить местоположение вражеских кораблей и потопить их.');

    document.getElementById('game-field').addEventListener('click', function (e) {
        controller.processGuess(e.target);
    });
}
window.onload = init;