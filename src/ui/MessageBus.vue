<script setup>
import { useMessageStore } from "@stores/message";

const messageStore = useMessageStore();
function beforeEnter(el) {
    el.style.opacity = 0;
    el.style.transform = "translateY(20px)";
}

function enter(el, done) {
    el.offsetHeight; // Принудительно перерисовываем, чтобы анимация работала
    el.style.opacity = 1;
    el.style.transform = "translateY(0)";
    done();
}

function leave(el, done) {
    el.style.opacity = 0;
    el.style.transform = "translateY(20px)";
    setTimeout(done, 500); // Длительность анимации
}
</script>

<template>
    <transition
        name="fade"
        @before-enter="beforeEnter"
        @enter="enter"
        @leave="leave"
    >
        <!-- layout -->
        <div
            v-if="messageStore.isShow"
            class="fixed z-50 bottom-5 flex w-full justify-center transform -translate-x-1/2"
        >
            <!-- message -->
            <div
                class="z-50  flex flex-row bg-white dark:bg-main-black border-2 border-main-white dark:border-main-gray rounded-lg px-4 py-2 gap-4"
            >
                <span>{{ messageStore.messageText }}</span>
                <button class="select-none" @click="messageStore.closeMessage">
                    &times;
                </button>
            </div>
        </div>
    </transition>
</template>

<style>
.fade-enter {
    opacity: 0;
    transform: translateY(20px);
}
.fade-enter-active {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.5s, transform 0.5s;
}
.fade-leave {
    opacity: 1;
    transform: translateY(0);
}
.fade-leave-active {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s, transform 0.5s;
}
</style>
