<script setup></script>
<template>
    <div class="flex h-screen justify-center items-center bg-main-black">
        <div class="flex flex-col gap-4 max-w-2xl">
            <h1 class="font-semibold text-6xl text-center my-4">Ошибка 404</h1>
            <p class="text-xl text-center my-4">
                Кажется, что-то пошло не так! Страница, которую вы запрашиваете,
                не существует. Возможно она устарела, была удалена, или был
                введен неверный адрес в адресной строке.
            </p>

            <router-link
                to="/"
                class="font-semibold hover:underline text-xl text-center my-4"
            >
                Вернуться на главную страницу
            </router-link>
        </div>
    </div>
</template>
