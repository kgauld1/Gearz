console.log('hi')
// module aliases
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

// create an engine
var engine = Engine.create();
var world = Engine.world;
engine.world.gravity.y = 0;

var gearScale = 30;

  // create a renderer
var render = Render.create({
    element: document.getElementById('animation-screen'),
    engine: engine,
    options: {
      showAngleIndicator: false,
      wireframes: false
    }
      
});

render.options.wireframeBackground = 'transparent';
render.options.background = '#bbc0c9';

var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true, collisionFilter: {group: 1} });
var wall1 = Bodies.rectangle(0,400,20,800, {isStatic: true, collisionFilter: {group: 1} });
var wall2 = Bodies.rectangle(800,400,20,800, {isStatic: true, collisionFilter: {group: 1} });
var roof = Bodies.rectangle(400,-10,810,60,{isStatic: true, collisionFilter: {group: 1} });

//creating the grid
var circ_grid = [];
let spacing = 30;
for (x=80; x<800-80; x+=spacing){
  for (y=80; y<600-80; y+=spacing){
   circ_grid.push(Bodies.circle(x+10, y+10, 5, {isStatic: true, collisionFilter:2}))
    // console.log(circ_grid[circ_grid.length-1]);
   World.add(engine.world, circ_grid[circ_grid.length-1]);
  }
}
	
var vertexSets = [], color = '#3b6db3'


// making motor + gears
var allGears = [];
var motor = Bodies.rectangle(200, 200, 80, 80,{ collisionFilter: {group: 1}});

async function getVertices(file){
	let svg = await (await fetch(file)).text();
	let el = document.createElement('svg');
	el.innerHTML = svg;
	let path = el.getElementsByTagName('path')[0];
	return Vertices.scale(Matter.Svg.pathToVertices(path), gearScale, gearScale);
}

async function makeGears(gears){
	var smallVertices = await getVertices('/svgs/small.svg');
	var medVertices = await getVertices('/svgs/medium.svg');

	for (let g = 0; g < gears.length; g++) {
		let verts;
		if (gears[g] == 1) verts = smallVertices;
		else if (gears[g] == 2) verts = medVertices;
		else verts = smallVertices;
		var gear = Bodies.fromVertices(150+g*100, 250, verts,{
			render: {
				fillStyle: color, strokeStyle: 'black',lineWidth: 3 
			},
			collisionFilter: {group: 1},
		});
		gear.constraint = null;
		allGears.push(gear);
		World.add(engine.world, gear);
	}

}

async function makeMotor(x, y){
	var smallVertices = await getVertices('/svgs/small.svg');
	motor = Bodies.fromVertices(x, y, smallVertices,{
    collisionFilter: {group: 1},
    render: {fillStyle: '#eaa221',lineWidth: 2, strokeStyle: 'black'},
    inertia: Infinity,
    isStatic: true,
    currentRotation: 0,
    rotationSpeed: 0.05
  });

  console.log(motor.rotationSpeed);
	World.add(engine.world, motor);
}


makeGears([1, 1, 2]);
makeMotor(90, 512);


// click in gears
var distCirc;
window.setInterval(function(){
	for (let g of allGears){
		if (mouseConstraint.body == g){
			if (g.constraint){
				Composite.remove(engine.world, g.constraint, true);
				g.constraint = null;
			}
			continue;
		}
		for (let circ of circ_grid){
			distCirc = Math.sqrt(Math.pow(circ.position.x - g.position.x,2)+Math.pow(circ.position.y - g.position.y,2));

      if (distCirc<20 && !g.constraint) {
        click(g,circ.position.x, circ.position.y)
      };
	  }
	}
}, 100) 

function click(obj,posX,posY) {
  console.log('click')
	var constraint = Constraint.create({
			pointA: { x: posX, y: posY },
			bodyB: obj,
			length: 0,
      stiffness: 0.5,
      damping: 0.01
	});
	obj.constraint = constraint;
	World.add(engine.world, constraint);
}


// // mouse controls for gears
var mouse = Mouse.create(render.canvas);
var mouseConstraint = MouseConstraint.create(engine,{
	mouse: mouse,
	constraint: {
		stiffness: 0.2,
		render: { visible: true }
	}
});


// turning motor off
var button = document.getElementById('motor-switch');

button.onclick = function(){
	if (motor.rotationSpeed == 0){
		button.innerHTML = 'Stop Motor';
		motor.rotationSpeed = 0.1;
	}
	else {
		button.innerHTML = 'Start Motor';
		motor.rotationSpeed = 0;
	}
}


// create runner
var runner = Runner.create();
Runner.run(runner, engine);

// add all of the bodies to the world
World.add(engine.world, [ground, mouseConstraint, wall1, wall2,roof]);


function updateRotation() {
    motor.currentRotation += 1*motor.rotationSpeed;
    Matter.Body.setAngle(motor, motor.currentRotation);
    requestAnimationFrame(updateRotation);
}
updateRotation();

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);
Render.mouse = mouse;

