import "./style.css";
import typescriptLogo from "./typescript.svg";
import viteLogo from "/vite.svg";
import { setupCounter } from "./counter.ts";
import "./script.ts"; // Import your script here to execute on page load

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <div id="profile">
      <h2>Profile</h2>
      <p id="displayName"></p>
      <div id="avatar"></div>
      <p id="id"></p>
      <p id="email"></p>
      <p><a id="uri" href=""></a></p>
      <p><a id="url" href=""></a></p>
      <p id="imgUrl"></p>
    </div>
    <div id="topTracks">
      <h2>Top Tracks</h2>
    </div>
    <div id="topArtists">
      <h2>Top Artists</h2>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`;

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);
