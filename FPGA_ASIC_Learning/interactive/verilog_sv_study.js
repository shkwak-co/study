const sections = ["mindset", "synth", "logic", "blocks", "fsm", "verify", "circuit", "practice"];
const completed = new Set(JSON.parse(localStorage.getItem("verilogSvCompleted") || "[]"));

const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");

function saveProgress() {
    localStorage.setItem("verilogSvCompleted", JSON.stringify([...completed]));
}

function updateProgress() {
    const percent = Math.round((completed.size / sections.length) * 100);
    progressText.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;

    document.querySelectorAll(".complete-btn").forEach((button) => {
        const key = button.dataset.complete;
        if (completed.has(key)) {
            button.classList.add("done");
            button.textContent = "완료됨";
        }
    });
}

document.querySelectorAll(".complete-btn").forEach((button) => {
    button.addEventListener("click", () => {
        completed.add(button.dataset.complete);
        saveProgress();
        updateProgress();
    });
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
        }
    });
}, { threshold: 0.16 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        const target = tab.dataset.tab;
        document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
        document.querySelectorAll(".code-panel").forEach((panel) => panel.classList.remove("active"));
        tab.classList.add("active");
        document.querySelector(`[data-panel="${target}"]`).classList.add("active");
    });
});

const inputA = document.querySelector("#inputA");
const xResult = document.querySelector("#xResult");

document.querySelectorAll("[data-x]").forEach((button) => {
    button.addEventListener("click", () => {
        const value = button.dataset.x;
        document.querySelectorAll("[data-x]").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        inputA.textContent = value;
        xResult.textContent = value === "0" ? "0" : value === "1" ? "1" : "X";
    });
});

const states = [
    {
        key: "IDLE",
        title: "ST_IDLE",
        text: "start가 들어올 때까지 대기합니다. 출력은 대부분 비활성 상태입니다."
    },
    {
        key: "LOAD",
        title: "ST_LOAD",
        text: "입력 데이터나 설정값을 register에 잡고 RUN으로 넘어갈 준비를 합니다."
    },
    {
        key: "RUN",
        title: "ST_RUN",
        text: "datapath가 실제 작업을 수행합니다. last 조건이 오면 DONE으로 이동합니다."
    },
    {
        key: "DONE",
        title: "ST_DONE",
        text: "done 출력을 한 cycle 또는 필요한 기간 동안 알리고 IDLE로 복귀합니다."
    }
];

let stateIndex = 0;
const stateName = document.querySelector("#stateName");
const stateText = document.querySelector("#stateText");

function renderState() {
    const current = states[stateIndex];
    stateName.textContent = current.title;
    stateText.textContent = current.text;
    document.querySelectorAll(".state").forEach((button) => {
        button.classList.toggle("active", button.dataset.state === current.key);
    });
}

document.querySelectorAll(".state").forEach((button) => {
    button.addEventListener("click", () => {
        stateIndex = states.findIndex((state) => state.key === button.dataset.state);
        renderState();
    });
});

document.querySelector("#nextState").addEventListener("click", () => {
    stateIndex = (stateIndex + 1) % states.length;
    renderState();
});

const quizResult = document.querySelector("#quizResult");

document.querySelectorAll(".quiz-btn").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".quiz-btn").forEach((item) => {
            item.classList.remove("correct", "incorrect");
        });

        if (button.dataset.answer === "right") {
            button.classList.add("correct");
            quizResult.textContent = "정답입니다. clocked always_ff에서는 보통 non-blocking assignment <= 를 사용합니다.";
        } else {
            button.classList.add("incorrect");
            quizResult.textContent = "다시 생각해보세요. register 갱신은 같은 clock edge의 이전 값을 기준으로 동시에 일어나야 합니다.";
        }
    });
});

const logicBoard = document.querySelector("#logicBoard");
const componentLayer = document.querySelector("#componentLayer");
const wireLayer = document.querySelector("#wireLayer");
const circuitHint = document.querySelector("#circuitHint");
const circuitMessage = document.querySelector("#circuitMessage");
const signalList = document.querySelector("#signalList");

const partDefs = {
    input: { title: "IN", kind: "switch", inputs: [], outputs: ["out"] },
    output: { title: "LED", kind: "probe", inputs: ["in"], outputs: [] },
    and: { title: "AND", kind: "gate", inputs: ["a", "b"], outputs: ["out"] },
    or: { title: "OR", kind: "gate", inputs: ["a", "b"], outputs: ["out"] },
    not: { title: "NOT", kind: "gate", inputs: ["in"], outputs: ["out"] },
    xor: { title: "XOR", kind: "gate", inputs: ["a", "b"], outputs: ["out"] },
    mux: { title: "MUX", kind: "2:1", inputs: ["a", "b", "sel"], outputs: ["out"] }
};

const portY = {
    input: { out: 37 },
    output: { in: 37 },
    and: { a: 24, b: 50, out: 37 },
    or: { a: 24, b: 50, out: 37 },
    not: { in: 37, out: 37 },
    xor: { a: 24, b: 50, out: 37 },
    mux: { a: 18, b: 37, sel: 56, out: 37 }
};

const circuit = {
    components: [],
    wires: [],
    selectedId: null,
    connecting: null,
    nextComponent: 1,
    nextWire: 1,
    signals: new Map(),
    loopComponents: new Set(),
    floatingPorts: []
};

function setCircuitMessage(text, isWarning = false) {
    if (!circuitMessage) return;
    circuitMessage.textContent = text;
    circuitMessage.classList.toggle("warn", isWarning);
}

function keyOf(componentId, port) {
    return `${componentId}:${port}`;
}

function getComponent(componentId) {
    return circuit.components.find((component) => component.id === componentId);
}

function signalClass(value) {
    return value === "1" ? "1" : value === "0" ? "0" : "X";
}

function boardPoint(event) {
    const rect = logicBoard.getBoundingClientRect();
    return {
        x: event.clientX - rect.left + logicBoard.scrollLeft,
        y: event.clientY - rect.top + logicBoard.scrollTop
    };
}

function getPortPoint(component, port, direction) {
    const y = portY[component.type][port] || 37;
    return {
        x: component.x + (direction === "out" ? 118 : 0),
        y: component.y + y
    };
}

function addComponent(type, x = 250, y = 190) {
    const id = `c${circuit.nextComponent++}`;
    circuit.components.push({
        id,
        type,
        x,
        y,
        value: type === "input" ? "0" : "X"
    });
    circuit.selectedId = id;
    setCircuitMessage(`${partDefs[type].title} 부품을 추가했습니다.`);
    simulateCircuit();
    renderCircuit();
}

function resetCircuitExample() {
    circuit.components = [
        { id: "c1", type: "input", x: 70, y: 150, value: "0" },
        { id: "c2", type: "input", x: 70, y: 290, value: "1" },
        { id: "c3", type: "and", x: 330, y: 220, value: "X" },
        { id: "c4", type: "output", x: 600, y: 220, value: "X" }
    ];
    circuit.wires = [
        { id: "w1", fromComponent: "c1", fromPort: "out", toComponent: "c3", toPort: "a" },
        { id: "w2", fromComponent: "c2", fromPort: "out", toComponent: "c3", toPort: "b" },
        { id: "w3", fromComponent: "c3", fromPort: "out", toComponent: "c4", toPort: "in" }
    ];
    circuit.selectedId = null;
    circuit.connecting = null;
    circuit.nextComponent = 5;
    circuit.nextWire = 4;
    setCircuitMessage("AND 게이트 기본 예제를 불러왔습니다.");
    simulateCircuit();
    renderCircuit();
}

function clearCircuit() {
    circuit.components = [];
    circuit.wires = [];
    circuit.selectedId = null;
    circuit.connecting = null;
    circuit.signals = new Map();
    circuit.loopComponents = new Set();
    circuit.floatingPorts = [];
    setCircuitMessage("회로 보드를 비웠습니다.");
    renderCircuit();
}

function deleteSelection() {
    if (!circuit.selectedId) {
        setCircuitMessage("삭제할 부품을 먼저 선택하세요.", true);
        return;
    }

    circuit.components = circuit.components.filter((component) => component.id !== circuit.selectedId);
    circuit.wires = circuit.wires.filter((wire) => {
        return wire.fromComponent !== circuit.selectedId && wire.toComponent !== circuit.selectedId;
    });
    circuit.selectedId = null;
    circuit.connecting = null;
    setCircuitMessage("선택한 부품과 연결선을 삭제했습니다.");
    simulateCircuit();
    renderCircuit();
}

function and3(a, b) {
    if (a === "0" || b === "0") return "0";
    if (a === "1" && b === "1") return "1";
    return "X";
}

function or3(a, b) {
    if (a === "1" || b === "1") return "1";
    if (a === "0" && b === "0") return "0";
    return "X";
}

function not3(a) {
    if (a === "0") return "1";
    if (a === "1") return "0";
    return "X";
}

function xor3(a, b) {
    if (a === "X" || b === "X") return "X";
    return a === b ? "0" : "1";
}

function mux3(a, b, sel) {
    if (sel === "0") return a;
    if (sel === "1") return b;
    return a === b ? a : "X";
}

function evaluateComponent(component, inputs) {
    if (circuit.loopComponents.has(component.id)) return "X";

    switch (component.type) {
        case "input":
            return component.value;
        case "and":
            return and3(inputs.a, inputs.b);
        case "or":
            return or3(inputs.a, inputs.b);
        case "not":
            return not3(inputs.in);
        case "xor":
            return xor3(inputs.a, inputs.b);
        case "mux":
            return mux3(inputs.a, inputs.b, inputs.sel);
        default:
            return inputs.in || "X";
    }
}

function findLoopComponents() {
    const adjacency = new Map();
    circuit.components.forEach((component) => adjacency.set(component.id, []));
    circuit.wires.forEach((wire) => {
        if (adjacency.has(wire.fromComponent)) {
            adjacency.get(wire.fromComponent).push(wire.toComponent);
        }
    });

    const visiting = new Set();
    const visited = new Set();
    const looped = new Set();

    function visit(id, path) {
        if (visiting.has(id)) {
            const start = path.indexOf(id);
            path.slice(start).forEach((loopId) => looped.add(loopId));
            return;
        }
        if (visited.has(id)) return;

        visiting.add(id);
        for (const next of adjacency.get(id) || []) {
            visit(next, [...path, next]);
        }
        visiting.delete(id);
        visited.add(id);
    }

    circuit.components.forEach((component) => visit(component.id, [component.id]));
    return looped;
}

function simulateCircuit() {
    const signals = new Map();
    const incoming = new Map();
    circuit.loopComponents = findLoopComponents();
    circuit.floatingPorts = [];

    circuit.wires.forEach((wire) => {
        incoming.set(keyOf(wire.toComponent, wire.toPort), wire);
    });

    circuit.components.forEach((component) => {
        const def = partDefs[component.type];
        def.inputs.forEach((port) => signals.set(keyOf(component.id, port), "X"));
        def.outputs.forEach((port) => signals.set(keyOf(component.id, port), component.type === "input" ? component.value : "X"));
    });

    for (let i = 0; i < circuit.components.length + 2; i++) {
        circuit.wires.forEach((wire) => {
            const value = signals.get(keyOf(wire.fromComponent, wire.fromPort)) || "X";
            signals.set(keyOf(wire.toComponent, wire.toPort), value);
        });

        circuit.components.forEach((component) => {
            const def = partDefs[component.type];
            if (def.outputs.length === 0) return;

            const inputValues = {};
            def.inputs.forEach((port) => {
                inputValues[port] = signals.get(keyOf(component.id, port)) || "X";
            });

            signals.set(keyOf(component.id, "out"), evaluateComponent(component, inputValues));
        });
    }

    circuit.components.forEach((component) => {
        const def = partDefs[component.type];
        def.inputs.forEach((port) => {
            if (!incoming.has(keyOf(component.id, port))) {
                circuit.floatingPorts.push({ component, port });
                signals.set(keyOf(component.id, port), "X");
            }
        });
    });

    circuit.signals = signals;
}

function renderWire(wire) {
    const from = getComponent(wire.fromComponent);
    const to = getComponent(wire.toComponent);
    if (!from || !to) return "";

    const start = getPortPoint(from, wire.fromPort, "out");
    const end = getPortPoint(to, wire.toPort, "in");
    const mid = Math.max(30, Math.abs(end.x - start.x) / 2);
    const value = circuit.signals.get(keyOf(wire.fromComponent, wire.fromPort)) || "X";
    const path = `M ${start.x} ${start.y} C ${start.x + mid} ${start.y}, ${end.x - mid} ${end.y}, ${end.x} ${end.y}`;
    const hot = value === "1" ? " hot" : "";

    return `<path class="wire${hot}" data-signal="${signalClass(value)}" d="${path}"></path>`;
}

function renderPorts(component, direction) {
    const def = partDefs[component.type];
    const ports = direction === "in" ? def.inputs : def.outputs;

    return ports.map((port) => {
        const value = circuit.signals.get(keyOf(component.id, port)) || "X";
        const active = circuit.connecting
            && circuit.connecting.componentId === component.id
            && circuit.connecting.port === port
            ? " active"
            : "";
        const top = `${portY[component.type][port] || 37}px`;
        const side = direction === "in" ? "input-port" : "output-port";
        return `<button class="port ${side}${active}" data-component="${component.id}" data-port="${port}" data-direction="${direction}" data-signal="${signalClass(value)}" style="top: ${top}" type="button" aria-label="${component.id} ${port} ${direction}">${port[0]}</button>`;
    }).join("");
}

function renderComponent(component) {
    const def = partDefs[component.type];
    const outputSignal = def.outputs.length
        ? circuit.signals.get(keyOf(component.id, "out")) || "X"
        : circuit.signals.get(keyOf(component.id, "in")) || "X";
    const selected = circuit.selectedId === component.id ? " selected" : "";
    const loop = circuit.loopComponents.has(component.id) ? " loop" : "";
    const toggle = component.type === "input"
        ? `<button class="mini-btn toggle-input" data-toggle-input="${component.id}" type="button">${component.value}</button>`
        : `<span class="component-value">${outputSignal}</span>`;

    return `
        <div class="component${selected}${loop}" data-component="${component.id}" data-type="${component.type}" data-signal="${signalClass(outputSignal)}" style="left: ${component.x}px; top: ${component.y}px;">
            ${renderPorts(component, "in")}
            <div class="component-title">
                <span>${def.title}</span>
                <span class="component-kind">${component.id} · ${def.kind}</span>
            </div>
            ${toggle}
            ${renderPorts(component, "out")}
        </div>
    `;
}

function renderStatus() {
    if (!signalList) return;

    const rows = circuit.components.map((component) => {
        const def = partDefs[component.type];
        const value = def.outputs.length
            ? circuit.signals.get(keyOf(component.id, "out")) || "X"
            : circuit.signals.get(keyOf(component.id, "in")) || "X";
        return `<div class="status-item"><span>${component.id} ${def.title}</span><strong class="status-value">${value}</strong></div>`;
    }).join("");

    signalList.innerHTML = rows || `<div class="status-item"><span>부품 없음</span><strong class="status-value">-</strong></div>`;

    if (circuit.loopComponents.size > 0) {
        setCircuitMessage("조합 루프가 감지되어 관련 출력이 X로 처리됩니다.", true);
    } else if (circuit.floatingPorts.length > 0) {
        const names = circuit.floatingPorts.slice(0, 3).map(({ component, port }) => `${component.id}.${port}`).join(", ");
        const suffix = circuit.floatingPorts.length > 3 ? " ..." : "";
        setCircuitMessage(`floating input: ${names}${suffix}`, true);
    }
}

function renderCircuit() {
    if (!logicBoard || !componentLayer || !wireLayer) return;

    wireLayer.innerHTML = circuit.wires.map(renderWire).join("");
    componentLayer.innerHTML = circuit.components.map(renderComponent).join("");
    renderStatus();
}

function connectPort(targetComponentId, targetPort, direction) {
    if (!circuit.connecting) {
        if (direction !== "out") {
            setCircuitMessage("연결은 출력 포트에서 시작해야 합니다.", true);
            return;
        }

        circuit.connecting = { componentId: targetComponentId, port: targetPort };
        setCircuitMessage("연결할 입력 포트를 선택하세요.");
        renderCircuit();
        return;
    }

    if (direction !== "in") {
        circuit.connecting = null;
        setCircuitMessage("입력 포트에만 연결할 수 있습니다.", true);
        renderCircuit();
        return;
    }

    if (circuit.connecting.componentId === targetComponentId) {
        circuit.connecting = null;
        setCircuitMessage("같은 부품 안에서는 연결하지 않습니다.", true);
        renderCircuit();
        return;
    }

    const alreadyDriven = circuit.wires.some((wire) => {
        return wire.toComponent === targetComponentId && wire.toPort === targetPort;
    });

    if (alreadyDriven) {
        circuit.connecting = null;
        setCircuitMessage("하나의 입력 포트는 하나의 출력만 drive할 수 있습니다.", true);
        renderCircuit();
        return;
    }

    circuit.wires.push({
        id: `w${circuit.nextWire++}`,
        fromComponent: circuit.connecting.componentId,
        fromPort: circuit.connecting.port,
        toComponent: targetComponentId,
        toPort: targetPort
    });
    circuit.connecting = null;
    setCircuitMessage("연결했습니다.");
    simulateCircuit();
    renderCircuit();
}

function attachCircuitEvents() {
    if (!logicBoard) return;

    document.querySelectorAll("[data-add-part]").forEach((button) => {
        button.addEventListener("click", () => {
            const index = circuit.components.length;
            const point = {
                x: 80 + (index % 4) * 160,
                y: 90 + (Math.floor(index / 4) % 4) * 112
            };
            addComponent(button.dataset.addPart, point.x, point.y);
        });
    });

    document.querySelector("#loadCircuitExample").addEventListener("click", resetCircuitExample);
    document.querySelector("#clearCircuit").addEventListener("click", clearCircuit);
    document.querySelector("#deleteCircuitSelection").addEventListener("click", deleteSelection);

    componentLayer.addEventListener("click", (event) => {
        const toggle = event.target.closest("[data-toggle-input]");
        if (toggle) {
            const component = getComponent(toggle.dataset.toggleInput);
            component.value = component.value === "1" ? "0" : "1";
            setCircuitMessage(`${component.id} 입력을 ${component.value}로 바꿨습니다.`);
            simulateCircuit();
            renderCircuit();
            return;
        }

        const port = event.target.closest(".port");
        if (port) {
            connectPort(port.dataset.component, port.dataset.port, port.dataset.direction);
            return;
        }

        const component = event.target.closest(".component");
        if (component) {
            circuit.selectedId = component.dataset.component;
            renderCircuit();
        }
    });

    componentLayer.addEventListener("pointerdown", (event) => {
        if (event.target.closest(".port") || event.target.closest("button")) return;

        const element = event.target.closest(".component");
        if (!element) return;

        const component = getComponent(element.dataset.component);
        const start = boardPoint(event);
        const origin = { x: component.x, y: component.y };
        let moved = false;

        circuit.selectedId = component.id;
        element.setPointerCapture(event.pointerId);

        function move(moveEvent) {
            const current = boardPoint(moveEvent);
            const dx = current.x - start.x;
            const dy = current.y - start.y;
            moved = moved || Math.abs(dx) + Math.abs(dy) > 4;
            component.x = Math.max(12, Math.min(920, origin.x + dx));
            component.y = Math.max(12, Math.min(480, origin.y + dy));
            element.style.left = `${component.x}px`;
            element.style.top = `${component.y}px`;
            wireLayer.innerHTML = circuit.wires.map(renderWire).join("");
        }

        function up() {
            element.removeEventListener("pointermove", move);
            element.removeEventListener("pointerup", up);
            if (moved) setCircuitMessage(`${component.id} 위치를 옮겼습니다.`);
            renderCircuit();
        }

        element.addEventListener("pointermove", move);
        element.addEventListener("pointerup", up);
    });

    logicBoard.addEventListener("click", (event) => {
        if (event.target === logicBoard && circuit.connecting) {
            circuit.connecting = null;
            setCircuitMessage("연결을 취소했습니다.");
            renderCircuit();
        }
    });

    resetCircuitExample();
}

document.querySelector("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("verilogSvTheme", document.body.classList.contains("dark") ? "dark" : "light");
});

if (localStorage.getItem("verilogSvTheme") === "dark") {
    document.body.classList.add("dark");
}

updateProgress();
renderState();
attachCircuitEvents();
