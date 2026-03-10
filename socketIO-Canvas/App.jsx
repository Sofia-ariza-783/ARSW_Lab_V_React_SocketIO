import './App.css';
import {useEffect, useRef} from 'react';
import p5 from "p5";
import {io} from "socket.io-client";

function App() {
    const myp5 = useRef(null);
    const socket = useRef(null);

    const sketch = function (p) {
        let lastX, lastY;
        let picker;

        p.setup = function () {
            let color = p.color(p.random(255),p.random(255), p.random(255));
            p.createCanvas(window.innerWidth, window.innerHeight);
            p.strokeWeight(5);
            picker = p.createColorPicker(color);
            picker.position(10, 10);
        }

        p.draw = function () {
            if (p.mouseIsPressed === true) {

                if (lastX === undefined) {
                    lastY = p.mouseY;
                    lastX = p.mouseX;
                }

                p.stroke(picker.color());
                p.line(lastX, lastY, p.mouseX, p.mouseY);

                if (socket.current) {
                    socket.current.emit('drawEvent', {type: 'draw',x1: lastX,y1: lastY, x2: p.mouseX, y2: p.mouseY, color: picker.color().toString() });
                }

                lastY = p.mouseY;
                lastX = p.mouseX;
            } else {
                lastY = undefined;
                lastX = undefined;
            }
        };
    };

    useEffect(() => {
        socket.current = io('http://3.17.173.82:9092');
        socket.current.on('drawBroadcast', (data) => {
            if (data.type === 'draw') {
                myp5.current.stroke(data.color);
                myp5.current.line(data.x1, data.y1, data.x2, data.y2);
            } else if (data.type === 'clear') {
                myp5.current.clear();
            }
        });

        if (!myp5.current) {
            myp5.current = new p5(sketch, "container");
        }

        return () => {
            socket.current.disconnect();
        };
    }, []);

    const clearCanvas = function (){
        myp5.current.clear();
        socket.current.emit('drawEvent', { type: 'clear' });
    };

    return (
        <div>
            <main className="canvasContainer">
                <div className="header">
                    Dibujo Online P5
                </div>

                <hr/>
                <div id="container"></div>
                <hr/>

                <button className="eraseButton"
                        onClick={clearCanvas}>
                    Clear
                </button>
            </main>
        </div>
    );
}

export default App
