document.addEventListener('DOMContentLoaded', () => {
    const quantidade = document.getElementById('quantidade');
    quantidade.addEventListener('keyup', () => {
        const valor = parseInt(quantidade.value, 10);
        if (!isNaN(valor) && valor > 0) {
            pegaPokemons(valor);
        } else {
            mostrarErro('Por favor, insira um número válido.');
        }
    });
    pegaPokemons(9);

    // Modal 
    const modal = document.getElementById("evolution-modal");
    const span = document.getElementsByClassName("close")[0];
    
    span.onclick = () => modal.style.display = "none";
    
    window.onclick = event => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});

async function pegaPokemons(quantidade) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${quantidade}`);
        const allpokemon = await response.json();
        const pokemonPromises = allpokemon.results.map(val => fetch(val.url).then(res => res.json()));
        const pokemons = await Promise.all(pokemonPromises);
        
        const pokemonBoxes = document.querySelector('.pokemon-boxes');
        pokemonBoxes.innerHTML = "";
        pokemons.forEach(pokemonSingle => {
            const pokemonBox = document.createElement('div');
            pokemonBox.classList.add('pokemon-box');
            pokemonBox.innerHTML = `
                <img src="${pokemonSingle.sprites.front_default}" alt="${pokemonSingle.name}">
                <p>${pokemonSingle.name}</p>
            `;
            pokemonBox.addEventListener('click', () => showEvolutions(pokemonSingle.species.url));
            pokemonBoxes.appendChild(pokemonBox);
        });
    } catch (error) {
        mostrarErro('Erro ao buscar os Pokémons.');
        console.error('Erro ao buscar os Pokémons:', error);
    }
}

async function showEvolutions(speciesUrl) {
    try {
        const speciesResponse = await fetch(speciesUrl);
        const speciesData = await speciesResponse.json();
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionChain = await evolutionResponse.json();
        
        const evolutionPromises = [];
        let currentEvolution = evolutionChain.chain;

        while (currentEvolution) {
            evolutionPromises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${currentEvolution.species.name}`).then(res => res.json()));
            currentEvolution = currentEvolution.evolves_to[0];
        }

        const evolutions = await Promise.all(evolutionPromises);
        const evolutionContent = document.getElementById('evolution-content');
        evolutionContent.innerHTML = evolutions.map(evolution => `
            <div class="evolution-box">
                <img src="${evolution.sprites.front_default}" alt="${evolution.name}">
                <p>${evolution.name}</p>
            </div>
        `).join('');

        const modal = document.getElementById("evolution-modal");
        modal.style.display = "block";
    } catch (error) {
        mostrarErro('Erro ao buscar as evoluções.');
        console.error('Erro ao buscar as evoluções:', error);
    }
}

function mostrarErro(mensagem) {
    const pokemonBoxes = document.querySelector('.pokemon-boxes');
    pokemonBoxes.innerHTML = `<p class="erro">${mensagem}</p>`;
}
