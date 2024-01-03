<script lang="ts">
  import { fileContentPromise$, openFile } from "./file";

  const onFileChange = (event: any) => {
    openFile(event.target.files[0]);
  };
</script>

<div class="container-fluid">
  <div class="mb-3 mt-3">
    <label for="formFile" class="form-label">Select a nwc or nwctxt file to display</label>
    <input class="form-control" type="file" id="formFile" on:change={onFileChange} />
  </div>

  {#if $fileContentPromise$}
    {#await $fileContentPromise$}
      Loading...
    {:then $fileContent$}
      <pre><code>{JSON.stringify($fileContent$, null, " ")}</code></pre>
    {:catch error}
      <div class="alert alert-danger">An error occurred while reading the file.<br />{error}<br /> You can try opening another file.</div>
    {/await}
  {/if}
</div>
