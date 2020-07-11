// var Example = Example || {};

// Example.svg = function() {
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
			Common = Matter.Common,
      Events = Matter.Events;
      Vector = Matter.Vector;

  // create an engine
  var engine = Engine.create();
  var world = Engine.world;
	engine.world.gravity.y = 0;

  // create a renderer
  var render = Render.create({
      element: document.getElementById('animation-screen'),
      engine: engine,
      options: {
        showAngleIndicator: true
      }
  });

  // create two boxes and a ground, 2 walls
  var boxA = Bodies.rectangle(200, 200, 80, 80,{collisionFilter: {group: 1}});
  var boxB = Bodies.rectangle(450, 50, 80, 80);
  var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true, collisionFilter: {group: 1} });
  var wall1 = Bodies.rectangle(0,400,20,800, {isStatic: true, collisionFilter: {group: 1} });
  var wall2 = Bodies.rectangle(800,400,20,800, {isStatic: true, collisionFilter: {group: 1} });
  var roof = Bodies.rectangle(400,-10,810,60,{isStatic: true, collisionFilter: {group: 1} });

  //create circle gears
  var cir1X = 400, cir1Y = 400, cir1Size = 30;
  var cir1 = Bodies.circle(cir1X, cir1Y, cir1Size, {collisionFilter: {group: 1}});

  //creating the grid
  var circ_grid = [];
  for (x=80; x<800-80; x+=40){
    for (y=80; y<600-80; y+=40){
     circ_grid.push(Bodies.circle(x+10, y+10, 5, {isStatic: true, collisionFilter:2}))
      // console.log(circ_grid[circ_grid.length-1]);
     World.add(engine.world, circ_grid[circ_grid.length-1]);
    }
  }
	
	var vertexSets = [],
		color = Common.choose(['#556270', '#4ECDC4', '#C7F464', '#FF6B6B', '#C44D58']);

var allGears = [];

fetch('/svgs/gear10.svg').then(resp => resp.text()).then(text => {
	let el = document.createElement('svg');
	el.innerHTML = text;
	let pathEl = el.getElementsByTagName('path')[0];
	var vertices = Matter.Svg.pathToVertices(pathEl);
	vertexSets.push(Vertices.scale(vertices, 1, 1));
	vertexSets.push(Vertices.scale(vertices, 1, 1));
	vertexSets.push(Vertices.scale(vertices, 1, 1));
	sizes = [[1, 1], [1,1], [2, 2]];
  console.log(sizes.length)
	for (let i of sizes){
    console.log(sizes);
		var gear = Bodies.fromVertices(150, 250, Vertices.scale(vertices, i[0], i[1],{
			render: {
					fillStyle: 'red',
					strokeStyle: 'black',
					lineWidth: 1
			},
			collisionFilter: {group: 1}
		}, true));

		allGears.push(gear);

		World.add(engine.world, gear);
		
	}
});

// click in gears
  var distCirc;
  window.setInterval(function(){
		for (let g of allGears){
			for (let circ of circ_grid){
				distCirc = Math.sqrt(Math.pow(circ.position.x - g.position.x,2)+Math.pow(circ.position.y - g.position.y,2));

        if (distCirc<20) {
				  click(g,circ.position.x, circ.position.y);
			  }
		  }
		}
  }, 100) 

  function click(obj,posX,posY) {
    console.log('click');
    Body.setPosition(obj,{x: posX, y: posY});
		Body.setVelocity(obj,{x: 0, y: 0});

    window.addEventListener('mousedown',function(){
      console.log('unclick');
    })
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

// create runner
var runner = Runner.create();
Runner.run(runner, engine);

// add all of the bodies to the world
World.add(engine.world, [boxA, ground, mouseConstraint, wall1, wall2,roof]);

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);
Render.mouse = mouse;
