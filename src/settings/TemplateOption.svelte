<script>
	export let itemLabel;
</script>

<div
	class="suggestion-item"
	on:keydown
	on:click
	on:mouseover
	on:mouseout
	on:focus
	on:blur
>
	{@html itemLabel}
</div>
