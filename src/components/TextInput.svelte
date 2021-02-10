<script lang="ts">
  export let value: string = '';
</script>

<input bind:value class="textinput border-grey30" {...$$props} />

<style>
  .textinput {
    width: 100%;
    color: #ffffff;
    outline: none;
    padding: 12px 12px;
    font-size: 14px;
    max-width: 100%;
    min-width: 100%;
    min-height: 48px;
    background: transparent;
    line-height: 24px;
    caret-color: #0a6cff;
    font-family: inherit;
    border-radius: 4px;
  }

  .textinput::placeholder {
    color: #676767;
  }

  .border-grey30 {
    border: 1px solid #383838;
  }
</style>
