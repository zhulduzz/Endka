import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x4879fe51e0ba3d5a146aabcc4d673af07e1d9633";
const CONTRACT_ABI = [
  "function play(uint8 _choice) external",
  "function getHistory() view returns (tuple(address player, uint8 choice, string result)[])"
];

function App() {
  const [contract, setContract] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const cont = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(cont);
    } else alert("Metamask не найден!");
  }, []);

  const choiceToString = (choice) => ["Камень", "Ножницы", "Бумага"][choice] || "Неизвестно";

  const playGame = async (choice) => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.play(choice);
      await tx.wait();
      alert("Ход отправлен!");
      fetchHistory();
    } catch (err) {
      console.error(err);
      alert("Ошибка транзакции");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!contract) return;
    try {
      const hist = await contract.getHistory();
      setHistory(hist.map(g => ({
        player: g.player,
        choice: choiceToString(g.choice),
        result: g.result
      })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { if (contract) fetchHistory(); }, [contract]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Rock Paper Scissors</h1>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => playGame(0)} disabled={loading}>Камень</button>
        <button onClick={() => playGame(1)} disabled={loading}>Ножницы</button>
        <button onClick={() => playGame(2)} disabled={loading}>Бумага</button>
      </div>
      <h2>История игр:</h2>
      <ul>
        {history.map((g, i) => <li key={i}>Игрок: {g.player} | Ход: {g.choice} | Результат: {g.result}</li>)}
      </ul>
    </div>
  );
}

export default App;
