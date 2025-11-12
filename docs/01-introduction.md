# Introduction

Cette application propose une expérience ludique autour de la génération et de la collection de Pokémon uniques créés via un service de **text-to-image**. L’utilisateur peut interagir avec l’application de manière fluide, conserver ses créations localement et gérer son solde de jetons de façon autonome.

## Concept général

L’application permet à chaque utilisateur de générer, posséder et revendre des Pokémon virtuels. Chaque session est centrée sur l’expérience de création et la gestion d’un portefeuille de jetons qui reflète ses actions dans l’application.

## Fonctionnement du système de jetons

*   Lors de la première connexion, l’utilisateur reçoit **100 jetons**.
*   Chaque génération de Pokémon coûte **10 jetons**.
*   Lorsqu’un Pokémon est revendu, l’utilisateur récupère un montant de jetons variable basé sur la **rareté** du Pokémon. Plus un Pokémon est rare, plus sa valeur de revente est élevée.
*   Le solde de jetons ne peut jamais être négatif.

Le solde et les actifs sont sauvegardés localement pour permettre une expérience **offline**.

## Score Pokédex

Pour ajouter un aspect compétitif, un **score Pokédex** est calculé en fonction de votre collection :
*   Chaque Pokémon **possédé** dans votre collection vous rapporte **5 points**.
*   Chaque Pokémon que vous avez **revendu** vous rapporte **1 point**.

Collectionner et conserver les Pokémon est donc la meilleure stratégie pour maximiser votre score !

## Parcours utilisateur

1.  **Accueil et onboarding**
    À sa première visite, l'utilisateur est accueilli par un écran expliquant les mécaniques du jeu. Il découvre ensuite son solde initial et accède à une interface simple pour générer des Pokémon.

2.  **Génération d’un Pokémon**
    Une génération démarre et dix (10) jetons sont alors débités immédiatement à la pression du bouton pour invoquer un Pokémon. Après validation par le service, le Pokémon est créé et ajouté à la collection locale de l’utilisateur.
3.  **Gestion de la collection**
    Les Pokémon générés peuvent être visualisés, triés et filtrés selon différents critères (date, rareté, nom). Chaque Pokémon possède un état indiquant s’il est encore possédé ou déjà revendu.

4.  **Revente d’un Pokémon**
    En revendant un Pokémon, l’utilisateur en abandonne la propriété et récupère des jetons sur son solde en fonction de la rareté du Pokémon.

## Objectifs et principes

*   Offrir une **expérience immersive** autour de la génération d’images.
*   Garantir une **autonomie utilisateur complète** grâce à la sauvegarde locale et à la résilience offline.
*   Proposer une **économie interne équilibrée** et transparente.
*   Favoriser une interaction continue entre créativité et gestion des ressources.

## Intégration API

Les spécifications détaillées des appels réseau, des structures de données et des formats de réponse sont décrites dans le document **api.md**.

## Perspectives d’évolution

*   Ajout d’un classement des meilleurs scores Pokédex.
*   Introduction de collections à thème ou d’événements saisonniers.
*   Mise en place d’un marché secondaire entre utilisateurs.
*   Intégration d’un mode collaboratif pour la génération de Pokémon partagés.
