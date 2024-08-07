document.addEventListener('DOMContentLoaded', () => {
    const quantidade = document.getElementById('quantidade');
    quantidade.addEventListener('keyup', () => {
        pegaPokemons(quantidade.value);
    });
    pegaPokemons(9);

    // Modal 
    const modal = document.getElementById("evolution-modal");
    const span = document.getElementsByClassName("close")[0];
    
    span.onclick = function() {
        modal.style.display = "none";
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});

function pegaPokemons(quantidade) {
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=${quantidade}`)
        .then(response => response.json())
        .then(allpokemon => {
            const pokemonPromises = allpokemon.results.map(val => fetch(val.url).then(res => res.json()));
            return Promise.all(pokemonPromises);
        })
        .then(pokemons => {
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
        })
        .catch(error => {
            console.error('Erro ao buscar os Pokémons:', error);
        });
}

function showEvolutions(speciesUrl) {
    fetch(speciesUrl)
        .then(response => response.json())
        .then(speciesData => fetch(speciesData.evolution_chain.url))
        .then(response => response.json())
        .then(evolutionChain => {
            const evolutionPromises = [];
            let currentEvolution = evolutionChain.chain;

            while (currentEvolution) {
                evolutionPromises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${currentEvolution.species.name}`).then(res => res.json()));
                currentEvolution = currentEvolution.evolves_to[0];
            }

            return Promise.all(evolutionPromises);
        })
        .then(evolutions => {
            const evolutionContent = document.getElementById('evolution-content');
            evolutionContent.innerHTML = evolutions.map(evolution => `
                <div class="evolution-box">
                    <img src="${evolution.sprites.front_default}" alt="${evolution.name}">
                    <p>${evolution.name}</p>
                </div>
            `).join('');

            const modal = document.getElementById("evolution-modal");
            modal.style.display = "block";
        })
        .catch(error => {
            console.error('Erro ao buscar as evoluções:', error);
        });
}
