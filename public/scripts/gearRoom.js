var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    World = Matter.World,
    Bodies = Matter.Bodies;
    Constraint = Matter.Constraint;
    Body = Matter.Body;
    Mouse = Matter.Mouse;
    MouseConstraint = Matter.MouseConstraint;
    Grid = Matter.Grid;
    Svg = Matter.Svg;
    Vertices = Matter.Vertices;
		Composites = Matter.Composites,
		Composite = Matter.Composite,
		Common = Matter.Common,
    Events = Matter.Events;
    Vector = Matter.Vector;




class GearRoom{

	constructor(element){
		this.engine = Engine.create();
		this.engine.world.gravity.y = 0;
		this.gearScale = 30;
		this.render = Render.create({
				element: element,
				engine: this.engine,
				options: {
					showAngleIndicator: false,
					wireframes: false
				}		
		});
		this.render.options.wireframeBackground = 'transparent';
		this.render.options.background = '#bbc0c9';
		this.motor = Bodies.rectangle(200, 200, 80, 80,{ collisionFilter: {group: 1}});
		this.circ_grid = [];
		this.allGears = [];
		this.motor = Bodies.rectangle(200, 200, 80, 80,{ collisionFilter: {group: 1}});
		this.endGear = Bodies.rectangle(200, 200, 80, 80,{ collisionFilter: {group: 1}});

		this.mouse = Mouse.create(this.render.canvas);
		this.mouseConstraint = MouseConstraint.create(this.engine,{
			mouse: this.mouse,
			constraint: {
				stiffness: 0.2,
				render: { visible: true }
			}
		});

		this.boundaries();
		this.makeGrid();
		this.snap();

		

	}

	async getVertices(file){
		let svg = await (await fetch(file)).text();
		let el = document.createElement('svg');
		el.innerHTML = svg;
		let path = el.getElementsByTagName('path')[0];
		return Vertices.scale(Matter.Svg.pathToVertices(path), this.gearScale, this.gearScale);
	}

	makeGrid(){
		let spacing = 30;
		for (let x=80; x<800-80; x+=spacing){
			for (let y=80; y<600-80; y+=spacing){
			this.circ_grid.push(Bodies.circle(x+10, y+10, 5, {isStatic: true, collisionFilter:2}));
			World.add(this.engine.world, this.circ_grid[this.circ_grid.length-1]);
			}
		}
	}

	boundaries(){
		var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true, collisionFilter: {group: 1} });
		var wall1 = Bodies.rectangle(0,400,20,800, {isStatic: true, collisionFilter: {group: 1} });
		var wall2 = Bodies.rectangle(800,400,20,800, {isStatic: true, collisionFilter: {group: 1} });
		var roof = Bodies.rectangle(400,-10,810,60,{isStatic: true, collisionFilter: {group: 1} });

		World.add(this.engine.world, [ground, this.mouseConstraint, wall1, wall2,roof]);
	}

	async addGears(gears){
		var smallVertices = await this.getVertices('/svgs/small.svg');
		var medVertices = await this.getVertices('/svgs/medium.svg');

		for (let g = 0; g < gears.length; g++) {
			let verts;
			if (gears[g] == 1) verts = smallVertices;
			else if (gears[g] == 2) verts = medVertices;
			else verts = smallVertices;
			var gear = Bodies.fromVertices(150+g*100, 250, verts,{
				render: {
					fillStyle: '#3b6db3', strokeStyle: 'black',lineWidth: 3 
				},
				collisionFilter: {group: 1},
			});
			gear.constraint = null;
			this.allGears.push(gear);
			World.add(this.engine.world, gear);
		}

	}

  async addEndGear(x, y){
		var medVertices = await this.getVertices('/svgs/medium.svg');

		let verts;
		verts = medVertices;
		this.endGear = Bodies.fromVertices(x, y, verts,{
			render: {
				fillStyle: 'rgb(230, 230, 80)', strokeStyle: 'black',lineWidth: 3 
			},
			collisionFilter: {group: 1},
		});
    
		this.click(this.endGear, x, y);
		World.add(this.engine.world, this.endGear);
	}

	async addMotor(x, y, type, motorButton){
		var verts;
		if (type == 1) verts = await this.getVertices('/svgs/small.svg');
		else if (type == 2) verts = await this.getVertices('/svgs/medium.svg');
		else verts = await this.getVertices('/svgs/small.svg');
		this.motor = Bodies.fromVertices(x, y, verts,{
			collisionFilter: {group: 1},
			render: {fillStyle: '#eaa221',lineWidth: 2, strokeStyle: 'black'},
			inertia: Infinity,
			isStatic: true,
			currentRotation: 0,
			rotationSpeed: 0.05
		});
		
		World.add(this.engine.world, this.motor);

		motorButton.onclick = function(){
			if (this.motor.rotationSpeed == 0){
				motorButton.innerHTML = 'Stop Motor';
				this.motor.rotationSpeed = 0.05;
			}
			else {
				motorButton.innerHTML = 'Start Motor';
				this.motor.rotationSpeed = 0;
			}
		}.bind(this);

		this.updateRotation();
	}

	placeGear(x, y, num){
		Body.setPosition(this.allGears[num], {x: x, y: y});
	}

	snap(){
		var distCirc;
		let count = -1;
		for (let g of this.allGears){
			count++;
			if (this.mouseConstraint.body == g){
				if (g.constraint){
					Composite.remove(this.engine.world, g.constraint, true);
					g.constraint = null;
				}
				continue;
			}
			for (let circ of this.circ_grid){
				distCirc = Math.sqrt(Math.pow(circ.position.x - g.position.x,2)+Math.pow(circ.position.y - g.position.y,2));

				if (distCirc<20 && !g.constraint) {
					this.click(g, circ.position.x, circ.position.y);
					socket.emit('place', {x: circ.position.x, y: circ.position.y, num: count});
				};
			}
		}

		setTimeout(() => this.snap(), 100);

		// requestAnimationFrame(() => this.snap());
	}

	click(obj,posX,posY) {
		var constraint = Constraint.create({
				pointA: { x: posX, y: posY },
				bodyB: obj,
				length: 0,
				stiffness: 0.5,
				damping: 0.01
		});
		obj.constraint = constraint;
		World.add(this.engine.world, constraint);
	}

	updateRotation() {
		this.motor.currentRotation += 1*this.motor.rotationSpeed;
		Matter.Body.setAngle(this.motor, this.motor.currentRotation);
		// requestAnimationFrame(this.updateRotation);
		requestAnimationFrame(()=>this.updateRotation());
	}

	run(){
		Engine.run(this.engine);
		Render.run(this.render);
		Render.mouse = this.mouse;
	}
}