var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers(); // ADD THIS for controller support

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ADD THIS to map controllers
app.MapControllers();

// REMOVE THIS - no longer needed since you have controllers
// app.MapGet("/api/hello", () =>
// {
//     return new { Message = "Welcome to DeShawn's Dog Walking" };
// });

app.Run();
