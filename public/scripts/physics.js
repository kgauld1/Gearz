var Example = Example || {};

Example.svg = function() {
  console.log('hi')
  // module aliases
  var Engine = Matter.Engine,
      Render = Matter.Render,
      World = Matter.World,
      Bodies = Matter.Bodies;
      Constraint = Matter.Constraint;
      Body = Matter.Body;
      Mouse = Matter.Mouse;
      MouseConstraint = Matter.MouseConstraint;
      Grid = Matter.Grid;
      Svg = Matter.Svg;
      Vertices = Matter.Vertices;
      Events = Matter.Events;
      Vector = Matter.Vector;

  // create an engine
  var engine = Engine.create();
  var world = Engine.world;

  // create a renderer
  var render = Render.create({
      element: document.getElementById('animation-screen'),
      engine: engine,
      options: {
        showAngleIndicator: true
      }
  });

  // create two boxes and a ground
  var boxA = Bodies.rectangle(200, 200, 80, 80);
  var boxB = Bodies.rectangle(450, 50, 80, 80);
  var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

  //create circle gears
  var cir1X = 100, cir1Y = 100, cir1Size = 30;
  var cir1 = Bodies.circle(cir1X, cir1Y, cir1Size);
  Body.setAngularVelocity(cir1, .5);

  var cir2 = Bodies.circle(500, 100, 5, {isStatic: true});

  // constraining gears
  var ptX = 500, ptY = 200;
  loc1Vector = Vector.create(ptX,ptY);
  sub = Vector.sub(cir1.position,loc1Vector);
  dist = Math.sqrt(Math.pow(sub, 2))
  if (dist<10) {
    click();
  }

  function click() {
    var options = {
    pointA: { x: ptX, y: ptY },
    bodyB: cir1,
    pointB: { x: 0, y: 0 },
    length:0,
    damping: 0.05
    }
    var loc1 = Constraint.create(options);
  }

  // Events.on(engine, 'collisionStart', function(event) {
  //   var pairs = event.pairs;      
  //   for (var i = 0, j = pairs.length; i != j; ++i) {
  //     var pair = pairs[i];
  //     if (pair.bodyA === cir1) {
  //       click();
  //     } else if (pair.bodyB === cir1) {
  //       click();
  //     }
  // }
  // })

  // // mouse controls for gears

  var mouse = Mouse.create(render.canvas);
  var mouseConstraint = MouseConstraint.create(engine,{
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: { visible: true }
        }
      });


  // changing svg into objs
  //var gear1 = 'https://repl.it/@kgauld1/Gearz#public/images/gear10.svg';

  var gear1Vertices = Svg.pathToVertices('https://repl.it/@kgauld1/Gearz#public/images/gear10.svg', 30);

  var gear1 = Bodies.fromVertices(300,300,gear1Vertices, { render: { lineWidth: 1 } });

  // create grid??
  // grid = Grid.create();
  // Grid.update(grid,[boxA], engine, forceUpdate = true);

  // create runner
  var runner = Runner.create();
  Runner.run(runner, engine);

  // add all of the bodies to the world
  World.add(world, [boxA, ground, cir1, cir2, gear1, loc1, mouseConstraint]);

  // run the engine
  Engine.run(engine);

  // run the renderer
  Render.run(render);
  Render.mouse = mouse;

  Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });
  
  return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function() {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
}