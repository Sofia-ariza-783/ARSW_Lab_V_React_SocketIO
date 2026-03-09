import './App.css';
import {useEffect, useRef, useState} from 'react';
import p5 from "p5";
import {Brush} from "lucide";

function App() {
    const [lineWidth, setLineWidth] = useState(5);
    const myp5 = useRef(null);

    const sketch = function (p) {
        let lastX, lastY;
        let picker;

        p.setup = function () {
            let color = p.color(p.random(255),p.random(255), p.random(255));
            p.createCanvas(window.innerWidth, window.innerHeight);
            p.strokeWeight(lineWidth);
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
                p.line(lastX, lastY, p.mouseX, p.mouseY)
                lastY = p.mouseY;
                lastX = p.mouseX;
            } else {
                lastY = undefined;
                lastX = undefined;
            }
        };
    };

    useEffect(() => {
        if (!myp5.current) {
            myp5.current = new p5(sketch,"container");
        }
    }, []);

    const clearCanvas = function (){
        myp5.current.clear()
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
