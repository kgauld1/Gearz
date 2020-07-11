
console.log('hello');


// module aliases
var Engine = Matter.Engine,
		Render = Matter.Render,
		World = Matter.World,
		Bodies = Matter.Bodies,
		Composites = Matter.Composites,
		Common = Matter.Common,
		Svg = Matter.Svg,
		Vertices = Matter.Vertices;
    Mouse = Matter.Mouse;
    MouseConstraint = Matter.MouseConstraint;

// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
		element: document.getElementById('animation-screen-2'),
		engine: engine
});

var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
var vertexSets = [],
		color = Common.choose(['#556270', '#4ECDC4', '#C7F464', '#FF6B6B', '#C44D58']);

fetch('/svgs/gear10.svg').then(resp => resp.text()).then(text => {
	let el = document.createElement('svg');
	el.innerHTML = text;
	let pathEl = el.getElementsByTagName('path')[0];
	console.log('gotPath');
	var vertices = Matter.Svg.pathToVertices(pathEl);
	console.log(vertices);
	vertexSets.push(Vertices.scale(vertices, 1, 1));
	vertexSets.push(Vertices.scale(vertices, 1, 1));
	vertexSets.push(Vertices.scale(vertices, 1, 1));

	World.add(engine.world, Bodies.fromVertices(150, 200, vertexSets, {
		render: {
				fillStyle: 'red',
				strokeStyle: 'black',
				lineWidth: 1
		},
		collisionFilter: {group: 1}
	}, true));
});

var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true, collisionFilter: {group: 1} });
	World.add(engine.world, ground);

// run the engine
Engine.run(engine);

var mouse = Mouse.create(render.canvas);
var mouseConstraint = MouseConstraint.create(engine,{
	mouse: mouse,
	constraint: {
		stiffness: 0.2,
		render: { visible: true }
	}
});
World.add(engine.world, mouseConstraint);


// run the renderer
Render.run(render);
Render.mouse = mouse;

